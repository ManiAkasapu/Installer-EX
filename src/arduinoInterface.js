const fs = require('fs');
const request = require('request');
const glob = require('glob');
const decompress = require('decompress');
const decompressUnzip = require('decompress-unzip');
const decompressTargz = require('decompress-targz');
const { exec } = require('child_process');
const { resolve } = require('path');

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

function downloadCLI() {
    if (!fs.existsSync(cli_path)){
        fs.mkdirSync(cli_path);
    }

    if(glob.sync(cli_path + cli_name_compressed).length === 0) {
        const cli_stream = fs.createWriteStream(cli_path + cli_name_compressed)
        var cli_url;

        console.log('got 1')

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
                resolve()
            })
            cli_download_request.on('error', () => {
                console.log("error")
                reject("error")
            })
            cli_download_request.on('close', () => {
                console.log("close")
                resolve()
            })
        })  
    }
    else {
        return new Promise((resolve, reject) => {
            resolve("File exists")
        })
    }
}

function decompressCLI() {
    console.log(cli_path + cli_name_compressed)
    console.log(cli_path + cli_name)


    return new Promise((resolve, reject) => {

        if (fs.existsSync(cli_path + cli_name)){
            resolve()
            return
        }

        if(process.platform === 'win32') {
            decompress(cli_path + cli_name_compressed, cli_path + cli_name, {
                plugins: [
                    decompressUnzip()
                ]
            }).then(() => {
                resolve()
            }, () => {
                reject("decompression error")
            })
        }
        else {
            console.log("hi")
            decompress(cli_path + cli_name_compressed, cli_path + cli_name, {
                plugins: [
                    decompressTargz()
                ]
            }).then(() => {
                resolve()
            }, () => {
                reject("decompression error")
            })
        }
    })
}

function coreInstall(win, dependency) {
    console.log('got 5')

    return new Promise((resolve, reject) => {
        if(process.platform === 'win32') {
            var cmd = exec(".\\arduino-cli core install " + dependency + " -v", { cwd: cli_path + cli_name })
        }
        else {
            var cmd = exec("./arduino-cli core install " + dependency + " -v", { cwd: cli_path + cli_name })
        }

        cmd.on('exit', () => {
            resolve()   // Clean exit
        })
        cmd.stdout.on('data', (data) => {
            win.webContents.send("console", data.toString())
        })
        cmd.stderr.on('data', (data) => {
            win.webContents.send("console", data.toString())
        })
    })
}

function upload(win, board, sketch, port) {
    console.log('got 6')

    return new Promise((resolve, reject) => {
        
        if(process.platform === 'win32') {
            var cmd = exec(".\\arduino-cli compile " + sketch + " -v -b " + board + " -p " + port + " -u", { cwd: cli_path + cli_name })
        }
        else {
            var cmd = exec("./arduino-cli compile " + sketch + " -v -b " + board + " -p " + port + " -u", { cwd: cli_path + cli_name })
        }

        cmd.on('exit', () => {
            resolve()   // Clean exit
        })
        cmd.stdout.on('data', (data) => {
            win.webContents.send("console", data.toString())
        })
        cmd.stderr.on('data', (data) => {
            win.webContents.send("console", data.toString())
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