import { createStore } from 'redux'


function _reducer(state = {}, action) {
    if(action.type === 'ReadConfig/Error')
    {
        console.log("Error file read \n" + action.text);
        return null;
    }

    return state;
}

export let reducer = createStore(_reducer);

