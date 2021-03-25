const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const sound = require('sound-play');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

//live reload
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
  awaitWriteFinish: true,
})


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 300,
    height: 400,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },

  });

  // mainWindow.setMenu(null);
  Menu.setApplicationMenu(null);

  ipcMain.on("resize", (event, width, height) => {
    console.log("size: ", [width, height])
    mainWindow.setSize(width, height + 20) // add 20 for the draggable bar
  })

  // ipcMain.on("start", (event, args) => {
  //   sound.play("./endSound.wav", 1)
  // })


  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();


  const devtools = new BrowserWindow();
  mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
  mainWindow.webContents.openDevTools({ mode: 'detach' });
  mainWindow.webContents.once('did-finish-load', function () {
    var windowBounds = mainWindow.getBounds();
    devtools.setPosition(windowBounds.x + windowBounds.width, windowBounds.y);
    devtools.setSize(windowBounds.width/2, windowBounds.height);
  });
  mainWindow.on('move', function () {
    var windowBounds = mainWindow.getBounds();
    devtools.setPosition(windowBounds.x + windowBounds.width, windowBounds.y);
  });

};

// make sound playable
app.commandLine.appendSwitch ('-autoplay-policy', 'no-user-gesture-required')

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
