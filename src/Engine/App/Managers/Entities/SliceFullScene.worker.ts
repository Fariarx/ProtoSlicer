import {slice, SliceResult} from "../../Utils/Slice";
import {Printer} from "../../Configs/Printer";

import {expose, ProxyMarked} from 'comlink';
import {Raycaster} from "three";
import * as THREE from "three";
import {MeshBVH} from "three-mesh-bvh";

export default {} as typeof Worker & { new (): Worker };

const api: any = {};

api.sliceLayer = async (_printer: string, numLayerFrom: number, numLayerTo: number) => {
    let arr: SliceResult[] = [];
    let start = numLayerFrom;

    const printer = JSON.parse(_printer) as Printer;
    const raycaster = new Raycaster();
    const geometry = new THREE.BufferGeometryLoader().parse(printer.workerData.geometry);
    const mesh = new MeshBVH(geometry);

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