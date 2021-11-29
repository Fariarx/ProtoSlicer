import {slice, SliceResult} from "../../Utils/Slice";
import {Printer} from "../../Configs/Printer";

import { expose } from 'comlink';
import {Raycaster} from "three";
import * as THREE from "three";
import {MeshBVH} from "three-mesh-bvh";

export default {} as typeof Worker & { new (): Worker };

const api: any = {};

api.sliceLayer = async (printerJson: string, numLayer: number) => {
    const printer = JSON.parse(printerJson) as Printer;
    const raycaster = new Raycaster();
    const geometry = new THREE.BufferGeometryLoader().parse(printer.workerData.geometry);
    const mesh = new MeshBVH(geometry);

    return slice(printer, numLayer, geometry, mesh, raycaster);
};

expose(api);