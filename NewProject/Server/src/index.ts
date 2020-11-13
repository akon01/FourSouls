/**
 * Server entry point
 * @author wheatup
 */
//ts-ignore
import Server from "./server";

const server = new Server();
server.init();
let os = require("os");
let ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
    let alias = 0;

    ifaces[ifname].forEach(function (iface) {
        if ("IPv4" !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
        }
        if (alias >= 1) {
        } else {
            process.title = iface.address;
        }
        ++alias;
    });

})
