import { Component, EditBox, find, log, sys, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { WrapperProvider } from '../Managers/WrapperProvider';
const { ccclass, property } = _decorator;



@ccclass('StatGame')
export class StatGame extends Component {

    startGame() {

        if (WrapperProvider.serverClientWrapper.out)
            if (WrapperProvider.serverClientWrapper.out.ws != null) {
                const serverLable = find("RenderRoot2D/Canvas/ServerIP")!.getComponent(EditBox)!
                sys.localStorage.setItem(`serverIp`, serverLable.string)
                WrapperProvider.serverClientWrapper.out.send(Signal.START_GAME)
            } else console.log('no connection')
    }


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    // update (dt) {}
}
