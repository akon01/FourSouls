import ServerClient from "../../ServerClient/ServerClient";
import Events from "../../Misc/Events";
import Signal from "../../Misc/Signal";


const { ccclass, property } = cc._decorator;

@ccclass
export default class StartGame extends cc.Component {

    startGame() {

        if (ServerClient.$.ws != null) {
            const serverLable = cc.find("Canvas/ServerIP").getComponent(cc.EditBox)
            cc.sys.localStorage.setItem(`serverIp`, serverLable.string)
            ServerClient.$.send(Signal.START_GAME)
        } else cc.log('no connection')
    }


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
