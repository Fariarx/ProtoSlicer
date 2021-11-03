import * as THREE from 'three'
import {storeMain} from "./Bridge";
import {DefaultConfig} from './DefaultConfig'

export default this;

export {LogSendText as Log}  from "./App/Notifications/ElementConsole";

export let Settings = () => {
    return storeMain.get('settings') as typeof DefaultConfig.settings;
}

export type ISceneMaterial = {
    normal: THREE.Material;
    select: THREE.Material;
}

export const SceneMaterials = {
    transparent: {
        normal: new THREE.MeshPhongMaterial({ color: '#ff7f7f', opacity: 0.7, transparent: true }) ,
        select: new THREE.MeshPhongMaterial({ color: '#858dff', opacity: 0.7, transparent: true }),
    } as ISceneMaterial,
    default: {
        normal: new THREE.MeshPhongMaterial( { color: '#ff7f7f', emissive:'#ffd4d4', emissiveIntensity:0.3 , flatShading: true, side: THREE.DoubleSide, shininess: 60 } ),
        select: new THREE.MeshPhongMaterial( { color: '#858dff', emissive:'#ffd4d4', emissiveIntensity:0.3 , flatShading: true, side: THREE.DoubleSide, shininess: 60 } ),
    } as ISceneMaterial,
}


declare global {
    interface Window {
        bridge:any
    }
}
