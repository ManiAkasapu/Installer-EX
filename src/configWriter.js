const write = require('write');
const isDev = require('electron-is-dev');

function configWrite(win, args, config) {
    win.webContents.send("console", "Writing config file...")

    var config_string = ""

    if(args["flavor"] === "CommandStation-EX") {
        config_string += "#define MOTOR_SHIELD_TYPE " + config[args["flavor"]]["motor_boards"][args["motor_shield_type"]]["id"] + "\n\r"
        config_string += "#define IP_PORT " + args["ip_port"] + "\n\r"
        config_string += "#define ENABLE_WIFI " + args["wifi_enable"] + "\n\r"
        if(args["dont_touch_wifi_conf"]) {
            config_string += "#define DONT_TOUCH_WIFI_CONF" + "\n\r" 
        } 
        else {
            config_string += "// #define DONT_TOUCH_WIFI_CONF" + "\n\r" 
        }
        config_string += "#define WIFI_SSID \"" + args["wifi_ssid"] + "\"\n\r" 
        config_string += "#define WIFI_PASSWORD \"" + args["wifi_password"] + "\"\n\r"
        config_string += "#define WIFI_HOSTNAME \"" + args["wifi_hostname"] + "\"\n\r"
        config_string += "#define ENABLE_FREE_MEM_WARNING " + args["enable_free_mem_warning"] + "\n\r"
        if(args["use_dhcp"]) {
            config_string += "// #define IP_ADDRESS " + args["ip_address"] + "\n\r"
        } else {
            config_string += "#define IP_ADDRESS " + args["ip_address"] + "\n\r"
        }
        if(args["ethernet_enable"]) {
            config_string += "#define MAC_ADDRESS " + args["mac_address"] + "\n\r"
        } else {
            config_string += "// #define MAC_ADDRESS " + args["mac_address"] + "\n\r"
        }
        if(args["lcd_enable"]) {
            config_string += "#define LCD_DRIVER " + args["lcd_address"] + "," + args["lcd_columns"] + "," + args["lcd_rows"] + "\n\r"
        }
        else {
            config_string += "// #define LCD_DRIVER " + args["lcd_address"] + "," + args["lcd_columns"] + "," + args["lcd_rows"] + "\n\r"
        }
        if(args["oled_enable"]) {
            config_string += "#define OLED_DRIVER " + args["oled_width"] + "," + args["oled_height"] + "\n\r"
        }
        else {
            config_string += "// #define OLED_DRIVER " + args["oled_width"] + "," + args["oled_height"] + "\n\r"
        }

        var path = ""
        var path_to_fw = ""

        if(process.platform === 'win32') {
            if(isDev) path_to_fw = __dirname + "\\extraResources\\"
            else path_to_fw = process.resourcesPath + "\\extraResources\\"
        }
        else {
            if(isDev) path_to_fw = __dirname + "/extraResources/"
            else path_to_fw = process.resourcesPath + "/extraResources/"
        }
    
        if(process.platform === 'win32') {
            path = path_to_fw + args["flavor"] + '\\config.h'
        }
        else {
            path = path_to_fw + args["flavor"] + '/config.h'
        }
    }
    else if(args["flavor"] === "BaseStation-Classic") {
        config_string += "#define MOTOR_SHIELD_TYPE " + config[args["flavor"]]["motor_boards"][args["motor_shield_type"]]["id"] + "\n\r"
        
        // TODO: Allow selection of max_main_registers
        config_string += "#define MAX_MAIN_REGISTERS 12\n\r"
        
        // TODO: Allow selection of which ethernet shield to use
        if(args["ethernet_enable"]) {
            config_string += "#define COMM_INTERFACE 1\n\r"
        } else {
            config_string += "#define COMM_INTERFACE 0\n\r"
        }
        
        if(args["use_dhcp"]) {
            config_string += "// #define IP_ADDRESS " + args["ip_address"] + "\n\r"
        } else {
            config_string += "#define IP_ADDRESS " + args["ip_address"] + "\n\r"
        }

        config_string += "#define ETHERNET_PORT " + args["ip_port"] + "\n\r"

        config_string += "#define MAC_ADDRESS " + args["mac_address"] + "\n\r"


        var path = ""
        var path_to_fw = ""

        if(process.platform === 'win32') {
            if(isDev) path_to_fw = __dirname + "\\extraResources\\"
            else path_to_fw = process.resourcesPath + "\\extraResources\\"
        }
        else {
            if(isDev) path_to_fw = __dirname + "/extraResources/"
            else path_to_fw = process.resourcesPath + "/extraResources/"
        }
    
        if(process.platform === 'win32') {
            path = path_to_fw + args["flavor"] + '\\DCCpp\\Config.h'
        }
        else {
            path = path_to_fw + args["flavor"] + '/DCCpp/Config.h'
        }
    }

    
   
    

    write.sync(path, config_string)

    win.webContents.send("console", "Wrote config to " + path)
}

exports.configWrite = configWrite