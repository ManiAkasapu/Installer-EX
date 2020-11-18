const {ipcRenderer} = require('electron')

var term = new Terminal();
term.open(document.getElementById("terminal"));
term.setOption('theme', { background: '#383838' });
term.writeln("Welcome to the DCC-EX Installer-EX!")

function submit_form() {
    var good_inputs = true

    if(document.getElementById('flavor').value === "") good_inputs = false
    if(document.getElementById('board').value === "") good_inputs = false
    if(document.getElementById('port').value === "") good_inputs = false
    if(document.getElementById('motor_shield_type').value === "") good_inputs = false
    if(document.getElementById('ip_port').value === "") document.getElementById('ip_port').value = 2560

    if(document.getElementById('wifi_enable').checked && !document.getElementById('dont_touch_wifi_conf').checked) {
        if(document.getElementById('wifi_ssid').value === "") document.getElementById('wifi_ssid').value = "err_no_ssid_provided"
        if(document.getElementById('wifi_hostname').value === "") document.getElementById('wifi_hostname').value = "dccex"
    } else if(!document.getElementById('wifi_enable').checked && document.getElementById('dont_touch_wifi_conf').checked){
        document.getElementById('dont_touch_wifi_conf').checked = false
    } 

    if(document.getElementById('board').value !== "mega") {
        document.getElementById('wifi_enable').checked = false
    }

    if(document.getElementById('ip1').value === "") document.getElementById('ip1').value = 192
    if(document.getElementById('ip2').value === "") document.getElementById('ip2').value = 168
    if(document.getElementById('ip3').value === "") document.getElementById('ip3').value = 1
    if(document.getElementById('ip4').value === "") document.getElementById('ip4').value = 200

    if(document.getElementById('mac1').value === "") document.getElementById('mac1').value = "0xDE"
    if(document.getElementById('mac2').value === "") document.getElementById('mac2').value = "0xAD"
    if(document.getElementById('mac3').value === "") document.getElementById('mac3').value = "0xBE"
    if(document.getElementById('mac4').value === "") document.getElementById('mac4').value = "0xEF"
    if(document.getElementById('mac5').value === "") document.getElementById('mac5').value = "0xFE"
    if(document.getElementById('mac6').value === "") document.getElementById('mac6').value = "0xEF"

    if(document.getElementById('lcd_address').value === "") document.getElementById('lcd_address').value = "0x3F"
    if(document.getElementById('lcd_rows').value === "") document.getElementById('lcd_rows').value = 2
    if(document.getElementById('lcd_columns').value === "") document.getElementById('lcd_columns').value = 16

    if(document.getElementById('oled_width').value === "") document.getElementById('oled_width').value = 128
    if(document.getElementById('oled_height').value === "") document.getElementById('oled_height').value = 32

    var ip_address = "{ " + document.getElementById('ip1').value + ", "
    ip_address += document.getElementById('ip2').value + ", "
    ip_address += document.getElementById('ip3').value + ", "
    ip_address += document.getElementById('ip4').value + " }"

    var mac_address = "{ " + document.getElementById('mac1').value + ", "
    mac_address += document.getElementById('mac2').value + ", "
    mac_address += document.getElementById('mac3').value + ", "
    mac_address += document.getElementById('mac4').value + ", "
    mac_address += document.getElementById('mac5').value + ", "
    mac_address += document.getElementById('mac6').value + " }"

    if(!good_inputs) {
        term.writeln("Bad inputs. Please check and try again.")
    }
    else { 
        ipcRenderer.send("flash", 
        {
            "flavor": document.getElementById('flavor').value,
            "board": document.getElementById('board').value,
            "port": document.getElementById('port').value,
            "motor_shield_type": document.getElementById('motor_shield_type').value,
            "ip_port": document.getElementById('ip_port').value,
            "wifi_enable": document.getElementById('wifi_enable').checked,
            "dont_touch_wifi_conf": document.getElementById('dont_touch_wifi_conf').checked,
            "wifi_ssid": document.getElementById('wifi_ssid').value,
            "wifi_password": document.getElementById('wifi_password').value,
            "wifi_hostname": document.getElementById('wifi_hostname').value,
            "ethernet_enable": document.getElementById('ethernet_enable').checked,
            "ip_address": ip_address,
            "mac_address": mac_address,
            "enable_free_mem_warning": document.getElementById('enable_free_mem_warning').checked,
            "lcd_enable": document.getElementById('lcd_enable').checked,
            "lcd_address": document.getElementById('lcd_address').value,
            "lcd_rows": document.getElementById('lcd_rows').value,
            "lcd_columns": document.getElementById('lcd_columns').value,
            "oled_enable": document.getElementById('oled_enable').checked,
            "oled_width": document.getElementById('oled_width').value,
            "oled_height": document.getElementById('oled_height').value,
            "use_dhcp": document.getElementById('use_dhcp').checked
        })
    }
}

const port_button = document.getElementById("scan")
port_button.addEventListener('click', () => {
    ipcRenderer.send("refresh")
})

ipcRenderer.on("refresh", (event, args) => {
    console.log(args);

    const port_select = document.getElementById("port");
    for(i = port_select.options.length - 1; i >= 0; i--) {
        port_select.remove(i);
    }
    args.forEach((port) => {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(port.name + " (" + port.man + ")"))
        opt.value = port.name;
        port_select.appendChild(opt);
    })
})

var lastTag = null

ipcRenderer.on("console", (event, args) => {
    console.log(args)
    console.log(event)
    term.writeln(args)
})
