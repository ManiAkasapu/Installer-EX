const write = require('write');

function configWrite(args) {
    var path = ""
    
    if(process.platform === 'win32') {
        path = '.\\git\\' + args[0] + '\\config.h'
    }
    else {
        path = './git/' + args[0] + '/config.h'
    }

    write.sync(path, '#define MOTOR_SHIELD_TYPE STANDARD_MOTOR_SHIELD\
    #define IP_PORT 2560\
    #define ENABLE_WIFI true\
    #define WIFI_SSID "Your network name"\
    #define WIFI_PASSWORD "Your network passwd"\
    #define WIFI_HOSTNAME "dccex"\
    //#define IP_ADDRESS { 192, 168, 1, 200 }\
    #define MAC_ADDRESS {  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xEF }\
    #define ENABLE_FREE_MEM_WARNING false')

}

exports.configWrite = configWrite