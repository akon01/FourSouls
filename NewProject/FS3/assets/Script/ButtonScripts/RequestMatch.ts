import { Component, log, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { WrapperProvider } from '../Managers/WrapperProvider';
const { ccclass, property } = _decorator;



@ccclass('RequestMatch')
export class RequestMatch extends Component {

    requestMatch() {

        if (WrapperProvider.serverClientWrapper.out)
            if (WrapperProvider.serverClientWrapper.out.ws != null) {
                log('request match')
                WrapperProvider.serverClientWrapper.out.send(Signal.MATCH)
            } else log('no connection')
    }


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    // update (dt) {}
}
