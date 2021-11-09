const path = require('path');
const fs = require('fs');
const { ipcRenderer } = require('electron')

class Store {
    constructor(opts, userData = null) {
        const userDataPath = userData ? userData : ipcRenderer.sendSync('electron.userData', 'ping');

        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        this.path = path.join(userDataPath, opts.configName + '.json');

        this.data = parseDataFile(this.path, opts.defaults);
    }

    // This will just return the property on the `data` object
    get(key) {
        return this.data[key];
    }

    // ...and this will set it
    set(key, val) {
        this.data[key] = val;
        // Wait, I thought using the node.js' synchronous APIs was bad form?
        // We're not writing a server so there's not nearly the same IO demand on the process
        // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
        // we might lose that data. Note that in a real app, we would try/catch this.
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }

    fullSave() {
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }
}

function parseDataFile(filePath, defaults) {
    // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
    // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
    try {
        let parsed = JSON.parse(fs.readFileSync(filePath));

        if(defaults.version && parsed.version !== defaults.version)
        {
            return defaults;
        }

        return parsed;
    } catch(error) {
        // if there was some kind of error, return the passed in defaults instead.
        return defaults;
    }
}

// expose the class
module.exports = Store;
