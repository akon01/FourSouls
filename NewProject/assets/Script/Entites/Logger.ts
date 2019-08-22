import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

export class Logger {

    static log(logData) {
        ServerClient.$.send(Signal.LOG, logData)
    }
}