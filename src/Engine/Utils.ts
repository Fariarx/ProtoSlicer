import {BufferGeometry} from "three";
import * as THREE from "three";

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
