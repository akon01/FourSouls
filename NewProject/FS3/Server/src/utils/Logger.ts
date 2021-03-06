
//@ts-nocheck
import * as fs from "fs";

export class Logger {

    currentLogFolderPath: string = ""
    currentServerLogFilePath: string = "";
    currentServerLogString = ""
    currentClientsLogFilePaths: Array<{ path: string, uuid: number, str: string }> = [];

    constructor() {
        const d = new Date()
        d.setTime(Date.now())
        const dateString = d.toDateString()
        if (!fs.existsSync(`./logs/${dateString} ${d.getHours()} ${d.getMinutes()}`)) {
            fs.mkdirSync(`./logs/${dateString} ${d.getHours()} ${d.getMinutes()}`)
        }
        this.currentLogFolderPath = `./logs/${dateString} ${d.getHours()} ${d.getMinutes()}`
        const logName = "Server Log"
        fs.appendFileSync(this.currentLogFolderPath + "/" + logName + ".txt", "Start Log")
        console.log("created file " + logName);
        this.currentServerLogFilePath = this.currentLogFolderPath + "/" + logName + ".txt";

        setInterval(this.commitLogWrite.bind(this), 3000)

    }

    commitLogWrite() {
        if (this.currentServerLogString != "") {
            fs.appendFileSync(this.currentServerLogFilePath, this.currentServerLogString)
            this.currentServerLogString = ""
        }
        this.currentClientsLogFilePaths.forEach(p => {
            if (p.str != "") {
                fs.appendFileSync(p.path, p.str)
                p.str = ""
            }
        })

    }

    logFromServer(playerUuid: number, logData) {
        const d = new Date()
        d.setTime(Date.now())
        this.currentServerLogString += " \n\n " + "Player " + playerUuid.toString() + " " + d.toLocaleTimeString() + " " + logData.signal + ": "
        //  fs.appendFileSync(this.currentServerLogFilePath, " \n\n " + "Player " + playerUuid.toString() + " " + d.toLocaleTimeString() + " " + logData.signal + ": ")

        if (logData.data != undefined) {
            const data = JSON.stringify(logData.data)
            this.currentServerLogString += " \n" + data
            //  fs.appendFileSync(this.currentServerLogFilePath, " \n" + data)
        }

        const playerPath = this.currentClientsLogFilePaths.find(clientPath => clientPath.uuid == playerUuid);
        if (playerPath) {
            this.logFromPlayer(playerPath.uuid, logData)
        }
    }

    addAPlayerToMatch(playerUuid: number) {
        const logName = `Player ${playerUuid} Log`

        const logPath = this.currentLogFolderPath + "/" + logName + ".txt"

        fs.appendFileSync(logPath, "Start Log")
        this.currentClientsLogFilePaths.push({ path: logPath, uuid: playerUuid, str: "" })

    }

    logFromPlayer(playerUuid: number, logData) {
        const d = new Date()
        d.setTime(Date.now())

        const myPath = this.currentClientsLogFilePaths.find(clientPath => clientPath.uuid == playerUuid)
        myPath.str += " \n " + "Recived From Player " + playerUuid.toString() + " " + d.toLocaleTimeString() + " " + logData.signal + ": "
        //fs.appendFileSync(myPath.path, " \n " + "Recived From Player " + playerUuid.toString() + " " + d.toLocaleTimeString() + " " + logData.signal + ": ")

        if (logData.data != undefined) {
            const data = JSON.stringify(logData.data)
            myPath.str += " \n\n " + data
            //  fs.appendFileSync(myPath.path, " \n\n " + data)
        }
    }

    logErrorFromPlayer(playerUuid: number, logData) {
        const d = new Date()
        d.setTime(Date.now())
        this.currentServerLogString += " \n//////Error From Player " + playerUuid + "////\n "
        //  fs.appendFileSync(this.currentServerLogFilePath, " \n//////Error From Player " + playerUuid + "////\n ")
        console.log(" \n//////Error From Player " + playerUuid + "////\n ");
        this.currentServerLogString += " \n\n " + "Player " + playerUuid.toString() + " " + d.toLocaleTimeString() + " " + logData.signal + ": "
        //fs.appendFileSync(this.currentServerLogFilePath, " \n\n " + "Player " + playerUuid.toString() + " " + d.toLocaleTimeString() + " " + logData.signal + ": ")
        const playerPath = this.currentClientsLogFilePaths.find(clientPath => clientPath.uuid == playerUuid);

        if (logData.data != undefined) {
            if (logData.data.message && logData.data.stack) {
                let message = JSON.stringify(logData.data.message)
                message = message.replace(new RegExp("\\\\n", "g"), "\n")
                let stack = JSON.stringify(logData.data.stack)

                stack = stack.replace(new RegExp("\\\\n", "g"), "\n")
                this.currentServerLogString += " \n//////Error From Player " + playerUuid + "////\n\n " + message + "\n\n + " + stack + "\n\n//////"
                //fs.appendFileSync(this.currentServerLogFilePath, " \n//////Error From Player " + playerUuid + "////\n\n " + message + "\n\n + " + stack + "\n\n//////")
                if (playerPath) {
                    this.currentServerLogString += " \n//////Error From Player " + playerUuid + "////\n\n " + message + "\n\n + " + stack + "\n\n//////"
                    //fs.appendFileSync(this.currentServerLogFilePath, " \n//////Error From Player " + playerUuid + "////\n\n " + message + "\n\n + " + stack + "\n\n//////")
                }
                console.log(" \n//////Error From Player " + playerUuid + "////\n\n " + message + "\n\n + " + stack + "\n\n//////");

            } else {
                this.currentServerLogString += " \n//////Error From Player " + playerUuid + "////\n " + logData + "\n//////"
                //  fs.appendFileSync(this.currentServerLogFilePath, " \n//////Error From Player " + playerUuid + "////\n " + logData + "\n//////")
                if (playerPath) {
                    //this.logFromPlayer(playerPath.uuid, logData)
                    playerPath.str += " \n//////Error From Player " + playerUuid + "////\n " + logData + "\n//////"
                    //   fs.appendFileSync(playerPath.path, " \n//////Error From Player " + playerUuid + "////\n " + logData + "\n//////")
                }

            }
        }

    }

}
