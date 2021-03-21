import { Component, EditBox, find, sys, _decorator } from 'cc';
import { Events } from "../../Misc/Events";
import { whevent } from "../../ServerClient/whevent";
import { WrapperProvider } from '../Managers/WrapperProvider';
const { ccclass, property } = _decorator;



@ccclass('ConnectToServerButton')
export class ConnectToServerButton extends Component {
  connectToServer() {

    if (WrapperProvider.serverClientWrapper.out) {
      if (WrapperProvider.serverClientWrapper.out.ws == null || WrapperProvider.serverClientWrapper.out.ws.readyState != 1) {
        //  cc.game.addPersistRootNode(cc.find('ServerClient'))
        whevent.emit(Events.MULTIPLAYER)
      } else {
        WrapperProvider.serverClientWrapper.out.onClose();
        WrapperProvider.serverClientWrapper.out.ws = null
        whevent.emit(Events.MULTIPLAYER)
      }
    }

  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {
    const ip = sys.localStorage.getItem(`serverIp`);
    if (ip) {
      const serverLable = find("RenderRoot2D/Canvas/ServerIP")!.getComponent(EditBox)!
      serverLable.string = ip
    }
  }

  // update (dt) {}
}
