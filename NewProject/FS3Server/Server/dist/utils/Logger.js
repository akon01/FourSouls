"use strict";
exports.__esModule = true;
var fs = require("fs");
var Logger = /** @class */ (function () {
    function Logger() {
        this.currentLogFolderPath = "";
        this.currentServerLogFilePath = "";
        this.currentClientsLogFilePaths = [];
        var d = new Date();
        d.setTime(Date.now());
        var dateString = d.toDateString();
        if (!fs.existsSync("./logs/" + dateString + " " + d.getHours() + " " + d.getMinutes())) {
            fs.mkdirSync("./logs/" + dateString + " " + d.getHours() + " " + d.getMinutes());
        }
        this.currentLogFolderPath = "./logs/" + dateString + " " + d.getHours() + " " + d.getMinutes();
        var logName = "Server Log";
        fs.appendFileSync(this.currentLogFolderPath + "/" + logName + ".txt", "Start Log");
        console.log("created file " + logName);
        this.currentServerLogFilePath = this.currentLogFolderPath + "/" + logName + ".txt";
    }
    Logger.prototype.logFromServer = function (playerUuid, logData) {
        var d = new Date();
        d.setTime(Date.now());
        fs.appendFileSync(this.currentServerLogFilePath, " \n\n " + "Player " + playerUuid.toString() + " " + d.toLocaleTimeString() + " " + logData.signal + ": ");
        if (logData.data != undefined) {
            var data = JSON.stringify(logData.data);
            fs.appendFileSync(this.currentServerLogFilePath, " \n" + data);
        }
        var playerPath = this.currentClientsLogFilePaths.find(function (clientPath) { return clientPath.uuid == playerUuid; });
        if (playerPath) {
            this.logFromPlayer(playerPath.uuid, logData);
        }
    };
    Logger.prototype.addAPlayerToMatch = function (playerUuid) {
        var logName = "Player " + playerUuid + " Log";
        var logPath = this.currentLogFolderPath + "/" + logName + ".txt";
        fs.appendFileSync(logPath, "Start Log");
        this.currentClientsLogFilePaths.push({ path: logPath, uuid: playerUuid });
    };
    Logger.prototype.logFromPlayer = function (playerUuid, logData) {
        var d = new Date();
        d.setTime(Date.now());
        var myPath = this.currentClientsLogFilePaths.find(function (clientPath) { return clientPath.uuid == playerUuid; });
        fs.appendFileSync(myPath.path, " \n " + "Recived From Player " + playerUuid.toString() + " " + d.toLocaleTimeString() + " " + logData.signal + ": ");
        if (logData.data != undefined) {
            var data = JSON.stringify(logData.data);
            fs.appendFileSync(myPath.path, " \n\n " + data);
        }
    };
    Logger.prototype.logErrorFromPlayer = function (playerUuid, logData) {
        var d = new Date();
        d.setTime(Date.now());
        fs.appendFileSync(this.currentServerLogFilePath, " \n//////Error From Player " + playerUuid + "////\n ");
        console.log(" \n//////Error From Player " + playerUuid + "////\n ");
        fs.appendFileSync(this.currentServerLogFilePath, " \n\n " + "Player " + playerUuid.toString() + " " + d.toLocaleTimeString() + " " + logData.signal + ": ");
        var playerPath = this.currentClientsLogFilePaths.find(function (clientPath) { return clientPath.uuid == playerUuid; });
        if (logData.data != undefined) {
            if (logData.data.message && logData.data.stack) {
                var message = JSON.stringify(logData.data.message);
                message = message.replace(new RegExp("\\\\n", "g"), "\n");
                var stack = JSON.stringify(logData.data.stack);
                stack = stack.replace(new RegExp("\\\\n", "g"), "\n");
                fs.appendFileSync(this.currentServerLogFilePath, " \n//////Error From Player " + playerUuid + "////\n\n " + message + "\n\n + " + stack + "\n\n//////");
                if (playerPath) {
                    fs.appendFileSync(this.currentServerLogFilePath, " \n//////Error From Player " + playerUuid + "////\n\n " + message + "\n\n + " + stack + "\n\n//////");
                }
                console.log(" \n//////Error From Player " + playerUuid + "////\n\n " + message + "\n\n + " + stack + "\n\n//////");
            }
            else {
                fs.appendFileSync(this.currentServerLogFilePath, " \n//////Error From Player " + playerUuid + "////\n " + logData + "\n//////");
                if (playerPath) {
                    //this.logFromPlayer(playerPath.uuid, logData)
                    fs.appendFileSync(playerPath.path, " \n//////Error From Player " + playerUuid + "////\n " + logData + "\n//////");
                }
            }
        }
    };
    return Logger;
}());
exports.Logger = Logger;
