
import Events from "../../Misc/Events";
import ServerClient from "../../ServerClient/ServerClient";
import { whevent } from "../../ServerClient/whevent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ConnectToServerButton extends cc.Component {


  connectToServer() {

    if (ServerClient.$.ws == null || ServerClient.$.ws.readyState != 1) {
      //  cc.game.addPersistRootNode(cc.find('ServerClient'))
      whevent.emit(Events.MULTIPLAYER)
    } else {
      ServerClient.$.onClose();
      ServerClient.$.ws = null
      whevent.emit(Events.MULTIPLAYER)
    }
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {
    const ip = cc.sys.localStorage.getItem(`serverIp`);
    if (ip) {
      const serverLable = cc.find("Canvas/ServerIP").getComponent(cc.EditBox)
      serverLable.string = ip
    }
  }

  // update (dt) {}
}
