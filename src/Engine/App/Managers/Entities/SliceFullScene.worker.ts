import {slice, SliceResult} from "../../Utils/Slice";
import {Printer} from "../../Configs/Printer";

import {expose, ProxyMarked} from 'comlink';
import {Raycaster} from "three";
import * as THREE from "three";
import {CENTER, MeshBVH, SAH, SplitStrategy} from "three-mesh-bvh";

export default {} as typeof Worker & { new (): Worker };

const api: any = {};

api.sliceLayers = async (printerJson: string, numLayerFrom: number, numLayerTo: number) => {
    let arr: SliceResult[] = [];
    let start = numLayerFrom;

    const printer = JSON.parse(printerJson) as Printer;
    const raycaster = new Raycaster();
    const geometry = new THREE.BufferGeometryLoader().parse(printer.workerData.geometry);
    const mesh = new MeshBVH(geometry, {
        maxLeafTris: 40
    });

    while (numLayerFrom <= numLayerTo) {
        arr.push(slice(printer, numLayerFrom, geometry, mesh, raycaster));
        await api.onState((numLayerFrom - start)/(numLayerTo - start));
        numLayerFrom++;
    }

    return arr;
};
api.onStateSetup = async function remoteFunction(callback: ((percent: string) => void) & ProxyMarked) {
    api.onState = callback;
};

expose(api);