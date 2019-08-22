import ServerClient from "../../ServerClient/ServerClient";
import Events from "../../Misc/Events";
import Signal from "../../Misc/Signal";



const { ccclass, property } = cc._decorator;

@ccclass
export default class RequestMatch extends cc.Component {

    requestMatch() {

        if (ServerClient.$.ws != null) {
            cc.log('request match')
            ServerClient.$.send(Signal.MATCH)
        } else cc.log('no connection')
    }


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
