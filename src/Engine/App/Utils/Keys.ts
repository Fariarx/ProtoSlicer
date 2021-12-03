import {Key} from "ts-keycode-enum";

let keysPressed: Array<Key> = [];

export  let isKeyPressed = (key: Key) => {
    return keysPressed.indexOf(key) !== -1;
}

window.addEventListener( 'keydown', (e)=>{
    if(keysPressed.indexOf(e.keyCode as Key) === -1)
    {
        keysPressed.push(e.keyCode as Key);
    }
}, false);
window.addEventListener( 'keyup',(e)=>{
    let index = keysPressed.indexOf(e.keyCode as Key);

    if(index > -1)
    {
        keysPressed.splice(index, 1);
    }
}, false );