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
            
            var rawdata = fs.readFileSync("./src/config.json")
            var config = JSON.parse(rawdata)
            var sequence = config[arg["flavor"]]["build-sequence"]

            console.log("Settings: " + arg)    
            console.log("Build sequence: " + config[arg["flavor"]]["build-sequence"])
            
            var sequencePromise = new Promise((resolve, reject) => {
                resolve()
            })

            sequence.forEach(element => {
                switch (element) {
                    case "lockOptions":
                        sequencePromise = sequencePromise.then(() => {
                            
                            // TODO: Replace this with lockOptions directive 

                            return new Promise((resolve, reject) => {
                                resolve()
                            })
                        })
                        break;
                    case "configWrite":
                        sequencePromise = sequencePromise.then(() => {
                            return configWriter.configWrite(win, arg, config)
                        })
                        break;
                    case "downloadCLI":
                        sequencePromise = sequencePromise.then(() => {
                            return arduinoInterface.downloadCLI(win)
                        })
                        break;
                    case "decompressCLI":
                        sequencePromise = sequencePromise.then(() => {
                            return arduinoInterface.decompressCLI(win)
                        })
                        break;
                    case "libraryInstall":
                        sequencePromise = sequencePromise.then(() => {
                            return arduinoInterface.libraryInstall(win, config, arg)
                        })
                        break;
                    case "coreInstall":
                        sequencePromise = sequencePromise.then(() => {

                            // TODO: Refactor to accept all args.
                            return arduinoInterface.coreInstall(win, arg["board"])
                        })
                        break;
                    case "upload":
                        sequencePromise = sequencePromise.then(() => {
                            if(arg["flavor"] === "CommandStation-EX") {
                                if(process.platform === 'win32') {
                                    return arduinoInterface.upload(win, arg["board"], "..\\..\\firmware\\" + arg["flavor"], arg["port"])
                                }
                                else {
                                    return arduinoInterface.upload(win, arg["board"], "../../firmware/" + arg["flavor"], arg["port"])
                                }
                            } else if(arg["flavor"] === "BaseStation-Classic") {
                                if(process.platform === 'win32') {
                                    return arduinoInterface.upload(win, arg["board"], "..\\..\\firmware\\" + arg["flavor"] + "\\DCCpp", arg["port"])
                                }
                                else {
                                    return arduinoInterface.upload(win, arg["board"], "../../firmware/" + arg["flavor"] + "/DCCpp", arg["port"])
                                }
                            } else {
                                console.log("Invalid flavor")
                            }
                        })
                        break;
                    case "unlockOptions":
                        sequencePromise = sequencePromise.then(() => {
                                
                            // TODO: Replace this with unlockOptions directive 

                            return new Promise((resolve, reject) => {
                                resolve()
                            })
                        })
                        break;
                    
                    default:
                        console.log("WARNING: invalid sequence option")
                        break;
                }
            });
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