// @ts-ignore
const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

if (isDev) {
    //live reload
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
        awaitWriteFinish: true,
    });
}

process.env.IS_DEV = isDev ? '1' : '0';


const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 300,
        height: 400,
        transparent: true,
        frame: false,
        webPreferences: {
            webSecurity: true,
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInWorker: true
        },
        icon: path.join(__dirname, '../public/favicon.png')
    });

    Menu.setApplicationMenu(null);

    /// custom listeners
    ipcMain.on("resize", (event, width, height) => {
        mainWindow.setSize(width, height);
    });

    ipcMain.on('stay-on-top', (e, value) => {
        if (typeof value === "boolean") {
            mainWindow.setAlwaysOnTop(value);
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

    let devtools = null;

    const launchDevTools = () => {
        devtools = new BrowserWindow();
        mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
        mainWindow.webContents.openDevTools({mode: 'detach'});
        devtools.on('closed', destroyDevTools)
    };

    const destroyDevTools = () => {
        devtools.destroy();
        mainWindow.webContents.closeDevTools();
        devtools = null;
    };

    ipcMain.on('devtools', (_) => {
        if (devtools === null) {
            launchDevTools()
        } else {
            destroyDevTools()
        }
    })


};

// make sound playable
app.commandLine.appendSwitch('-autoplay-policy', 'no-user-gesture-required');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
