const SerialPort = require('serialport');

function scanPorts() {
    return new Promise((resolve, reject) => {
        var out = new Array();

        SerialPort.list()
        .then((ports) => {
            ports.forEach((port) => {
                console.log(port)
                pm = port['manufacturer'];
                name = port['path'];
                if(pm !== undefined) {
                    out.push({ 'name' : name , 'man' : pm });
                } 
            })

            resolve(out); 
        }, (ports) => {
            console.log("error in scanning serial ports")
            reject(ports);
        });

           
    });
}

exports.scanPorts = scanPorts;