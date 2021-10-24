const Store = require('./store');
const fs = require('fs');

window.bridge = {};
window.bridge.fs = fs;
window.bridge.store = (data) => {
    return new Store(JSON.parse(data));
};



