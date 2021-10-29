import * as THREE from 'three'
import {storeMain} from "./Bridge";
import {DefaultConfig} from './DefaultConfig'

export default this;

export {LogSendText as Log}  from "./App/Notifications/Console";

export let Settings = () => {
    return storeMain.get('settings') as typeof DefaultConfig.settings;
}

export type ISceneMaterial = {
    normal: THREE.Material | THREE.Material[];
    select: THREE.Material | THREE.Material[];
}

export const SceneMaterials = {
    transparent: {
        normal: new THREE.MeshPhongMaterial({ color: '#ff7f7f', opacity: 0.7, transparent: true }) ,
        select: new THREE.MeshPhongMaterial({ color: '#858dff', opacity: 0.7, transparent: true }),
    } as ISceneMaterial,
    default: {
        normal: new THREE.MeshPhongMaterial( { color: '#ff7f7f' , emissive:'#998686', emissiveIntensity:0.3 , flatShading: true, side: THREE.DoubleSide, shininess: 30 } ),
        select: new THREE.MeshPhongMaterial( { color: '#858dff' , emissive:'#998686', emissiveIntensity:0.3 , flatShading: true, side: THREE.DoubleSide, shininess: 30 } ),
    } as ISceneMaterial,
}


declare global {
    interface Window {
        bridge:any
    }
}
