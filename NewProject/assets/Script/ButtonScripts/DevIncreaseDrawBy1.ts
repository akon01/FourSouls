import Server from "../../ServerClient/ServerClient";
import Events from "../../Misc/Events";
import Signal from "../../Misc/Signal";
import MainScript from "../MainScript";
import ActionManager from "../Managers/ActionManager";
import TurnsManager from "../Managers/TurnsManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class DevIncreaseBy1 extends cc.Component {

    drawIncrease(){
        let actionManager:ActionManager = cc.find('MainScript/ActionManager').getComponent(ActionManager)
        TurnsManager.currentTurn.drawPlays +=1
        ActionManager.updateActions()
    }

    lootCardIncrease(){
        let actionManager:ActionManager = cc.find('MainScript/ActionManager').getComponent(ActionManager)
        TurnsManager.currentTurn.lootCardPlays +=1
        ActionManager.updateActions()
    }

    buyIncrease(){
        let actionManager:ActionManager = cc.find('MainScript/ActionManager').getComponent(ActionManager)
        TurnsManager.currentTurn.buyPlays +=1
        ActionManager.updateActions()
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
