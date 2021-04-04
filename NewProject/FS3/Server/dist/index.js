"use strict";
exports.__esModule = true;
/**
 * Server entry point
 * @author wheatup
 */
//@ts-nocheck
var server_1 = require("./server");
var server = new server_1["default"]();
server.init();
var os = require("os");
var ifaces = os.networkInterfaces();
Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;
    ifaces[ifname].forEach(function (iface) {
        if ("IPv4" !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
        }
        if (alias >= 1) {
        }
        else {
            process.title = iface.address;
        }
        ++alias;
    });
});
