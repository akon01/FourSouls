"use strict";
exports.__esModule = true;
var fs = require("fs");
var Logger = /** @class */ (function () {
    function Logger() {
        this.currentClientsLogFilePaths = [];
        var d = new Date();
        d.setTime(Date.now());
        var dateString = d.toDateString();
        if (!fs.existsSync("./logs/" + dateString + " " + d.getHours() + " " + d.getMinutes())) {
            fs.mkdirSync("./logs/" + dateString + " " + d.getHours() + " " + d.getMinutes());
        }
        this.currentLogFolderPath = "./logs/" + dateString + " " + d.getHours() + " " + d.getMinutes();
        var logName = "Server Log";
        fs.appendFileSync(this.currentLogFolderPath + '/' + logName + '.txt', 'Start Log');
        console.log('created file ' + logName);
        this.currentServerLogFilePath = this.currentLogFolderPath + '/' + +logName + '.txt';
    }
    Logger.prototype.logFromServer = function (playerUuid, logData) {
        var d = new Date();
        d.setTime(Date.now());
        fs.appendFileSync(this.currentServerLogFilePath, ' \n ' + 'Player ' + playerUuid.toString() + ' ' + d.toLocaleTimeString() + ' ' + logData.signal + ': ');
        if (logData.data != undefined) {
            var data = JSON.stringify(logData.data);
            fs.appendFileSync(this.currentServerLogFilePath, ' \n ' + data);
        }
    };
    Logger.prototype.addAPlayerToMatch = function (playerUuid) {
        var logName = "Player " + playerUuid + " Log";
        fs.appendFileSync(this.currentLogFolderPath + '/' + logName + '.txt', 'Start Log');
        this.currentClientsLogFilePaths.push('./logs/' + logName + '.txt');
    };
    Logger.prototype.logFromPlayer = function (playerUuid, logData) {
        var d = new Date();
        d.setTime(Date.now());
        var myPath = this.currentClientsLogFilePaths[playerUuid - 1];
        fs.appendFileSync(myPath, ' \n ' + 'Player ' + playerUuid.toString() + ' ' + d.toLocaleTimeString() + ' ' + logData.signal + ': ');
        if (logData.data != undefined) {
            var data = JSON.stringify(logData.data);
            fs.appendFileSync(myPath, ' \n ' + data);
        }
    };
    return Logger;
}());
exports.Logger = Logger;
