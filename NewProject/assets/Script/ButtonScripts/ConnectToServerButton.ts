
import Events from "../../Misc/Events";
import Server from "../../ServerClient/ServerClient";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ConnectToServerButton extends cc.Component {


  connectToServer() {

    if (Server.$.ws == null) {
      //  cc.game.addPersistRootNode(cc.find('ServerClient'))
      whevent.emit(Events.MULTIPLAYER)
    } else cc.log('not connected to server')
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {

  }

  // update (dt) {}
}
