import * as THREE from 'three'
import {storeMain} from "./Bridge";
import {DefaultConfig} from './DefaultConfig'

export default this;

export {LogSendText as Log}  from "./App/Notifications/Console";

export let Settings = () => {
    return storeMain.get('settings') as typeof DefaultConfig.settings;
}

export interface ISceneMaterial {
    normal: THREE.MeshBasicMaterial,
    select: THREE.MeshBasicMaterial,
}

export const SceneMaterials = {
    default: {
        normal: new THREE.MeshStandardMaterial( { color: '#ff5533' , emissive:'#998686', emissiveIntensity:0.4 , flatShading: true, side: THREE.DoubleSide } ),
        select: new THREE.MeshStandardMaterial( { color: '#4962de' , emissive:'#998686', emissiveIntensity:0.4 , flatShading: true, side: THREE.DoubleSide } ),
    } as ISceneMaterial
}

declare global {
    interface Window {
        bridge:any
    }
}
