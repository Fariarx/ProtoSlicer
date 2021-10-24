import * as THREE from 'three'

export default this;

export {LogSendText as Log}  from "./UI/Console/Console";

export const Materials = {
    wireframe: new THREE.MeshBasicMaterial( { color: 0xff5533, wireframe: true } ),
    def: new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 0, emissive:0xff5533, flatShading: true } ),
}



