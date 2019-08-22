
import Events from "../../Misc/Events";
import ServerClient from "../../ServerClient/ServerClient";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ConnectToServerButton extends cc.Component {


  connectToServer() {

    if (ServerClient.$.ws == null || ServerClient.$.ws.readyState != 1) {
      //  cc.game.addPersistRootNode(cc.find('ServerClient'))
      whevent.emit(Events.MULTIPLAYER)
    } else cc.log('Cant connect To Server')
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {

  }

  // update (dt) {}
}
