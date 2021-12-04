
import {storeMain} from "./Bridge";
import {DefaultConfig} from './DefaultConfig'
import {acceleratedRaycast, computeBoundsTree, disposeBoundsTree} from "three-mesh-bvh";
import { Vector3 } from "three";
import * as THREE from 'three'
import {LineMaterial} from "three/examples/jsm/lines/LineMaterial";

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export const Directions = {
    Up: new Vector3() ,
    Down: new Vector3().setX( Math.PI / 2),
    Forward: new Vector3().setZ( Math.PI / 2),
    //Left: new Vector3().setZ( Math.PI / 2).setY(Math.PI / 2),
}

export default this;

export {LogSendText as Log}  from "./App/Scene/ChildrenUI/Notifications/ElementConsole";

export let Settings = () => {
    return storeMain.get('settings') as typeof DefaultConfig.settings;
}
export let SaveSettings = () => {
    storeMain.fullSave();
}

export type ISceneMaterial = {
    normal: THREE.Material;
    select: THREE.Material;
}

export const MaterialForSupports = {
    normal: new THREE.MeshNormalMaterial({ transparent: true, opacity: 0.7 })
}

export const  matLine = new LineMaterial({
    color: 0xa1a1a1,
    linewidth: 3
});

export const SceneMaterials = {
    transparent: {
        normal: new THREE.MeshPhongMaterial({ color: '#ff7f7f', opacity: 0.7, transparent: true }) ,
        select: new THREE.MeshPhongMaterial({ color: '#858dff', opacity: 0.7, transparent: true }),
    } as ISceneMaterial,
    default: {
        normal: new THREE.MeshPhongMaterial( { color: '#f8a745', emissive:'#ffd4d4', emissiveIntensity:0.3 , flatShading: true, side: THREE.DoubleSide, shininess: 20 } ),
        select: new THREE.MeshPhongMaterial( { color: '#858dff', emissive:'#ffd4d4', emissiveIntensity:0.3 , flatShading: true, side: THREE.DoubleSide, shininess: 20 } ),
    } as ISceneMaterial,
}


declare global {
    interface Window {
        bridge:any
    }
}
