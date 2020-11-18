const fs = require('fs');
const glob = require('glob');
const decompress = require('decompress');
const decompressUnzip = require('decompress-unzip');
const request = require('request');

function downloadUnpackGithubZip(win, url, name, path) {
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    }

    var delimit = ""
    if(process.platform === 'win32') delimit = "\\"
    else delimit = "/"
    
    const download_stream = fs.createWriteStream(path + delimit + name + ".zip")

    download_promise = new Promise((resolve, reject) => {
        if(glob.sync(path + delimit + name).length !== 0) { 
            win.webContents.send("console", "Package already downloaded: " + name)
            resolve()
            return
        }

        var download_request = request(url).pipe(download_stream);
        console.log("there")

        download_request.on('finish', () => {
            win.webContents.send("console", "Successfully downloaded package " + name + " from " + url)
            resolve()
        })
        download_request.on('error', () => {
            win.webContents.send("console", "Failed to download package " + name + " from " + url)
            console.log("error")
            reject()
        })
        download_request.on('close', () => {
            win.webContents.send("console", "Successfully (maybe) downloaded package " + name + " from " + url)
            console.log("close")
            resolve()
        })
    })

    download_promise.then(() => {
        console.log("here")
        return new Promise((resolve, reject) => {
            if (fs.existsSync(path + delimit + name)){
                win.webContents.send("console", "Package already unarchived: " + name)
                resolve()
                return
            }

            decompress(path + delimit + name + ".zip", path + delimit + name, {
                plugins: [
                    decompressUnzip()
                ]
            }).then(() => {
                win.webContents.send("console", "Successfully unzipped: " + name)
                resolve()
            }, () => {
                win.webContents.send("console", "Failed to unzip: " + name)
                reject()
            })
        })
    })
}

exports.downloadUnpackGithubZip = downloadUnpackGithubZip