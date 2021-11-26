const Store = require('./store');
const fs = require('fs');
const path = require('path');
const url = require('url');

window.bridge = {};
window.bridge.fs = fs;
window.bridge.url = url;
window.bridge.path = path;
window.bridge.__dirname = __dirname;
window.bridge.store = (data) => {
    return new Store(JSON.parse(data));
};


const { ipcRenderer } = require('electron')

window.bridge.userData = ipcRenderer.sendSync('electron.userData', '');
window.bridge.checkFocus = () => {
    return ipcRenderer.sendSync('electron.checkFocus', '')
};
window.minimizeWindow = () => {
    ipcRenderer.send('electron.minimize')
}
window.maximizeWindow = () => {
    ipcRenderer.send('electron.maximize')
}
window.closeWindow = () => {
    ipcRenderer.send('electron.closeWindow')
}
