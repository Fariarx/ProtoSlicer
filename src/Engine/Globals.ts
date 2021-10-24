import * as THREE from 'three'

export const DefaultConfig = {
    configName: 'app',
    defaults: {
        version: 0
    }
};

export default this;

export {LogSendText as Log}  from "./UI/Console/Console";

export const Materials = {
    wireframe: new THREE.MeshBasicMaterial( { color: 0xff5533, wireframe: true } ),
    def: new THREE.MeshStandardMaterial( { color: 0xff5533 , emissive:0xff5533, emissiveIntensity:0.4 , flatShading: true, side: THREE.DoubleSide } ),
}
