const { app, BrowserWindow } = require('electron')
const arduinoInterface = require("./arduinoInterface")
const downloadManager = require('./downloadManager')
const configWriter = require('./configWriter')
const { ipcMain } = require('electron')
const fs = require('fs')

function createWindow () {
  // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
        nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    win.loadFile('./src/index.html')

    // Open the DevTools.
    win.webContents.openDevTools()


    ipcMain.on("flash", (event, arg) => {
        if(event.frameId === win.id) {
            console.log(arg)
    
            arduinoInterface.downloadCLI()
            .then(() => {
                arduinoInterface.decompressCLI()
            }).then(() => {
                if(process.platform === 'win32') {
                    downloadManager.clonePublicRepo("https://github.com/DCC-EX/" + arg[0] + ".git", '.\\git')
                }
                else {
                    downloadManager.clonePublicRepo("https://github.com/DCC-EX/" + arg[0] + ".git", './git')
                }
            }).then(() => {
                configWriter.configWrite(arg)
            }).then(() => {
                if(process.platform === 'win32') {
                    arduinoInterface.coreInstall(win, "arduino:avr")
                }
                else {
                    arduinoInterface.coreInstall(win, "arduino:avr")
                }
            }).then(() => {
                if(process.platform === 'win32') {
                    arduinoInterface.upload(win, arg[1], "..\\..\\git\\CommandStation-EX", arg[2])
                }
                else {
                    arduinoInterface.upload(win, arg[1], "../../git/CommandStation-EX", arg[2])
                }
            })
        }
    })    
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const serialPortManager = require('./serialPortManager');
const { default: simpleGit } = require('simple-git')
const { fstat } = require('fs')

ipcMain.on("refresh", (event, arg) => {
    console.log("Refresh")
    serialPortManager.scanPorts()
    .then((ports) => {
        console.log(ports)
        event.sender.send("refresh", ports);
    }, () => { 
        console.log("error in scan")
    })    
})