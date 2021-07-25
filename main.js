// main.js

// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const Julius = require('./julius.js')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    //left: 0,
    //top: 0,
    //width: 1500,
    //height: 800,
    useContentSize: true,
    transparent: true,
    show: true,
    frame: false,
    resizable: true,
    //'always-on-top': true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.setFullScreen(true);
  //mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const win = createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  win.webContents.on('did-finish-load', () => {
    julius = new Julius()
    julius.connect(10500, "localhost")
    julius.data( (words, score, result) => {
      console.log(`Detected: ${words} ${score}`)
      win.webContents.send("sound", words) // レンダラープロセスへsendしています
    })
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
