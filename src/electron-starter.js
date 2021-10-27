const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const isDev = (() => {
    let isDev = false;

    process.argv.forEach(function (val, index, array) {
        if(val === "--dev")
        {
            isDev = true;
        }
    });

    return isDev;
})();

const path = require('path');
const url = require('url');

const { ipcMain } = require('electron')

var mainWindowFocus = false;

ipcMain.on('electron.userData', (event, arg) => {
    event.returnValue = electron.app.getPath('userData');
})
ipcMain.on('electron.checkFocus', (event, arg) => {
    event.returnValue = mainWindowFocus;
})

const Store = require('./store');

const DefaultConfig = {
    configName: 'windowsSize',
    defaults: {
        version: 1
    }
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    const screenElectron = electron.screen;
    const display = screenElectron.getPrimaryDisplay();
    const dimensions = display.workAreaSize;
    const size = 0.5 * (dimensions.height + dimensions.width) / 2;

    DefaultConfig.defaults.windowBoundsMain = {};
    DefaultConfig.defaults.windowBoundsMain.width = size * 1.5;
    DefaultConfig.defaults.windowBoundsMain.height = size;

    const store = new Store(DefaultConfig, electron.app.getPath('userData'));

    //console.log(electron.app.getPath('userData'))

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: store.get('windowBoundsMain').width,
        height: store.get('windowBoundsMain').height,
        minWidth: size * 1.5,
        minHeight: size,
        maxWidth: dimensions.width,
        maxHeight: dimensions.height,
        show:false,
        autoHideMenuBar: true,
        "webPreferences": {
            preload: path.join(__dirname, "preload.js"), // use a preload script
            nodeIntegration: true,
            webSecurity: false,
            contextIsolation: false,
            nodeIntegrationInWorker: true,
            nodeIntegrationInSubFrames: true
        }
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : url.format({
                pathname: path.join(__dirname, '../build/index.html'),
                protocol: 'file:',
                slashes: true,
            })
    );

    app.on('browser-window-focus', () => {
        if (mainWindow) {
            //console.log('browser-window-focus');
            mainWindowFocus = true;
        }
    });

    app.on('browser-window-blur', () => {
        if (mainWindow) {
            //console.log('browser-window-blur');
            mainWindowFocus = false;
        }

    });

    if (isDev) {
        // Open the DevTools.
        mainWindow.webContents.openDevTools();
        mainWindow.webContents.setFrameRate(30)
    }
    else {
        mainWindow.webContents.setFrameRate(60)
    }

    mainWindow.removeMenu();

    mainWindow.on('resize', function () {
        var size = mainWindow.getSize();

        store.set('windowBoundsMain', {
            width: size[0],
            height: size[1]
        })
    });
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    /*mainWindow.webContents.on('crashed', (e) => {
        app.relaunch();
        app.quit()
    });*/
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
