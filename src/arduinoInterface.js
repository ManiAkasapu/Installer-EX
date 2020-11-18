const fs = require('fs');
const request = require('request');
const glob = require('glob');
const decompress = require('decompress');
const decompressUnzip = require('decompress-unzip');
const decompressTargz = require('decompress-targz');
const { spawn } = require('cross-spawn');

var cli_path = ""
var cli_name = ""
var cli_name_compressed = ""

if(process.platform === 'win32') {
    cli_path = process.cwd() + '\\cli'
    cli_name = '\\arduino-cli' + process.platform + '-' + process.arch
    cli_name_compressed = cli_name + '.zip'
}
else {
    cli_path = process.cwd() + '/cli'
    cli_name = '/arduino-cli' + process.platform + '-' + process.arch
    cli_name_compressed = cli_name + '.tar.gz'
}

function downloadCLI(win) {
    win.webContents.send("console", "Downloading Arduino CLI...")

    if (!fs.existsSync(cli_path)){
        win.webContents.send("console", "Made new directory for Arduino CLI")
        fs.mkdirSync(cli_path);
    }

    if(glob.sync(cli_path + cli_name_compressed).length === 0) {
        const cli_stream = fs.createWriteStream(cli_path + cli_name_compressed)
        var cli_url;

        if(process.platform === 'darwin') {
            cli_url = 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_macOS_64bit.tar.gz'
        }
        else if(process.platform === 'linux' && process.arch === 'x64') {
            cli_url = 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_64bit.tar.gz'
        }
        else if(process.platform === 'linux' && process.arch === 'x32') {
            cli_url = 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_32bit.tar.gz'
        }
        else if(process.platform === 'linux' && process.arch === 'arm') {
            cli_url = 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_ARMv7.tar.gz'
        }
        else if(process.platform === 'linux' && process.arch === 'arm') {
            cli_url = 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_ARMv7.tar.gz'
        }
        else if(process.platform === 'linux' && process.arch === 'arm64') {
            cli_url = 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_ARM64.tar.gz'
        }
        else if(process.platform === 'win32' && process.arch === 'x64') {
            cli_url = 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip'
        }
        else if(process.platform === 'win32' && process.arch === 'x32') {
            cli_url = 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_32bit.zip'
        }
        else {
            return new Promise((resolve, reject) => {
                reject("Invalid Arch")
            })
        }

        return new Promise((resolve, reject) => {
            var cli_download_request = request(cli_url).pipe(cli_stream);
            cli_download_request.on('finish', () => {
                win.webContents.send("console", "Successfully downloaded Arduino CLI archive")
                resolve()
            })
            cli_download_request.on('error', () => {
                win.webContents.send("console", "Failed to download Arduino CLI archive")
                console.log("error")
                reject("error")
            })
            cli_download_request.on('close', () => {
                win.webContents.send("console", "Successfully (maybe) downloaded Arduino CLI archive")
                console.log("close")
                resolve()
            })
        })  
    }
    else {
        return new Promise((resolve, reject) => {
            win.webContents.send("console", "Arduino CLI already downloaded. Skipping download step.")
            resolve()
        })
    }
}

function decompressCLI(win) {
    console.log(cli_path + cli_name_compressed)
    console.log(cli_path + cli_name)


    return new Promise((resolve, reject) => {

        if (fs.existsSync(cli_path + cli_name)){
            win.webContents.send("console", "Arduino CLI already unarchived")
            resolve()
            return
        }

        console.log("Unarchiving Arduino CLI")

        if(process.platform === 'win32') {
            
            decompress(cli_path + cli_name_compressed, cli_path + cli_name, {
                plugins: [
                    decompressUnzip()
                ]
            }).then(() => {
                win.webContents.send("console", "Successfully unzipped Arduino CLI")
                resolve()
            }, () => {
                win.webContents.send("console", "Failed to unzip Arduino CLI")
                reject()
            })
        }
        else {
            decompress(cli_path + cli_name_compressed, cli_path + cli_name, {
                plugins: [
                    decompressTargz()
                ]
            }).then(() => {
                win.webContents.send("console", "Successfully unarchived Arduino CLI")
                resolve()
            }, () => {
                win.webContents.send("console", "Failed to unarchive Arduino CLI")
                reject()
            })
        }
    })
}

function libraryInstall(win, config, args) {
    win.webContents.send("console", "Installing Arduino libraries...")

    const libs = config[ args["flavor"] ][ "boards" ][ args["board"] ][ "libraries" ] 
    var libstring = ""
    libs.forEach(element => {
        libstring += element + " "    
    });

    return new Promise((resolve, reject) => {
        var cmd = spawn("arduino-cli lib install " + libstring, [], { cwd: cli_path + cli_name })

        cmd.on('exit', () => {
            win.webContents.send("console", "Finished installing Arduino libraries: " + libstring)
            resolve()   // Clean exit
        })
        cmd.stdout.on('data', (data) => {
            console.log(data.toString());
            win.webContents.send("console", data)
        })
        cmd.stderr.on('data', (data) => {
            console.log(data.toString());
            win.webContents.send("console", data)
        })
    })
}

function coreInstall(win, board, config) {
    win.webContents.send("console", "Checking for Arduino core installation: " + config["CommandStation-EX"]["boards"][board]["core"])

    return new Promise((resolve, reject) => {
        
        var cmd = spawn("arduino-cli", ["core", "install", config["CommandStation-EX"]["boards"][board]["core"]], { cwd: cli_path + cli_name })
      
        cmd.on('exit', () => {
            win.webContents.send("console", "Finished installing arduino core " + config["CommandStation-EX"]["boards"][board]["core"])
            resolve()   // Clean exit
        })
        cmd.stdout.on('data', (data) => {
            console.log(data.toString());
            win.webContents.send("console", data)
        })
        cmd.stderr.on('data', (data) => {
            console.log(data.toString());
            win.webContents.send("console", data)
        })
    })
}

function upload(win, board, sketch, port, config) {
    win.webContents.send("console", "Uploading to " + config["CommandStation-EX"]["boards"][board]["id"] + " on " + port + "...")

    return new Promise((resolve, reject) => {
        
        var cmd = spawn("arduino-cli", ["compile", sketch, "-b", config["CommandStation-EX"]["boards"][board]["id"], "-p", port, "-u"], { cwd: cli_path + cli_name })
        

        cmd.on('exit', () => {
            win.webContents.send("console", "Finished upload step")
            resolve()   // Clean exit
        })
        cmd.stdout.on('data', (data) => {
            console.log(data.toString());
            win.webContents.send("console", data)
        })
        cmd.stderr.on('data', (data) => {
            console.log(data.toString());
            win.webContents.send("console", data)
        })
    })
}

exports.cli_path = cli_path
exports.cli_name = cli_name
exports.cli_name_compressed = cli_name_compressed
exports.downloadCLI = downloadCLI
exports.decompressCLI = decompressCLI
exports.coreInstall = coreInstall
exports.upload = upload
exports.libraryInstall = libraryInstall