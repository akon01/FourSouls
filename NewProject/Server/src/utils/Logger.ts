
import * as fs from "fs";

export class Logger {

    currentLogFolderPath: string
    currentServerLogFilePath: string;
    currentClientsLogFilePaths: string[] = [];


    constructor() {
        let d = new Date()
        d.setTime(Date.now())
        let dateString = d.toDateString()
        if (!fs.existsSync(`./logs/${dateString} ${d.getHours()} ${d.getMinutes()}`)) {
            fs.mkdirSync(`./logs/${dateString} ${d.getHours()} ${d.getMinutes()}`)
        }
        this.currentLogFolderPath = `./logs/${dateString} ${d.getHours()} ${d.getMinutes()}`
        let logName = `Server Log`
        fs.appendFileSync(this.currentLogFolderPath + '/' + logName + '.txt', 'Start Log')
        console.log('created file ' + logName);
        this.currentServerLogFilePath = this.currentLogFolderPath + '/' + + logName + '.txt';

    }

    logFromServer(playerUuid: number, logData) {
        let d = new Date()
        d.setTime(Date.now())
        fs.appendFileSync(this.currentServerLogFilePath, ' \n ' + 'Player ' + playerUuid.toString() + ' ' + d.toLocaleTimeString() + ' ' + logData.signal + ': ')

        if (logData.data != undefined) {
            let data = JSON.stringify(logData.data)
            fs.appendFileSync(this.currentServerLogFilePath, ' \n ' + data)
        }
    }

    addAPlayerToMatch(playerUuid: number) {
        let logName = `Player ${playerUuid} Log`
        fs.appendFileSync(this.currentLogFolderPath + '/' + logName + '.txt', 'Start Log')
        this.currentClientsLogFilePaths.push('./logs/' + logName + '.txt')
    }

    logFromPlayer(playerUuid: number, logData) {
        let d = new Date()
        d.setTime(Date.now())
        let myPath = this.currentClientsLogFilePaths[playerUuid - 1]
        fs.appendFileSync(myPath, ' \n ' + 'Player ' + playerUuid.toString() + ' ' + d.toLocaleTimeString() + ' ' + logData.signal + ': ')

        if (logData.data != undefined) {
            let data = JSON.stringify(logData.data)
            fs.appendFileSync(myPath, ' \n ' + data)
        }
    }

}