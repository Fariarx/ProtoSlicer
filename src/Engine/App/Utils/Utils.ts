import {BufferGeometry, Scene} from "three";
import * as THREE from "three";
import {sceneStore} from "../Scene/SceneStore";

export const LinearGenerator = (()=>{
    let linearGenerator: number = 0;

    return function () {
        linearGenerator++;

        return linearGenerator;
    }
})();
export function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(+str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
export function isFloat(n) {
    return n === +n && n !== (n|0);
}

export function isInteger(n) {
    return n === +n && n === (n|0);
}
export function SimpleCopyObj(from: any, to:any) {
    for(let val1 in from)
    {
        to[val1] = from[val1];
    }
}
export function DrawDirLine(origin, dir, scene: Scene = sceneStore.scene, length : number = 100)
{
    dir.normalize();

    const hex = 0xf27f00;

    const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );

    scene.add( arrowHelper );
}
export function DrawPoint(origin,  scene, size : number = 0.05)
{
    const geometry = new THREE.SphereGeometry( size, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0xf27f00 } );
    const sphere = new THREE.Mesh( geometry, material );

    sphere.position.set(origin.x,origin.y,origin.z);

    scene.add( sphere );
}