import { hideCardPreview } from "./CardModule";
import BattleManager from "../Managers/BattleManager";
import { DeclareAttackAction } from "../Entites/Action";
import Signal from "../../Misc/Signal";
import ActionManager from "../Managers/ActionManager";
import Card from "../Entites/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterAttackable extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.showMonsterPreview, this)
        let cardPreview: cc.Node = cc.find('Canvas/CardPreview')
        //cc.log(cardPreview.active)
    }
    onDisable() {

        this.node.off(cc.Node.EventType.TOUCH_START, this.showMonsterPreview, this)
    }

    attackAMonster() {
        BattleManager.declareAttackOnMonster(this.node)
    }

    showMonsterPreview() {
        //cc.log('show monster preview()')
        let cardPreview: cc.Node = cc.find('Canvas/CardPreview')
        //cc.log(cardPreview.active)
        let sprite = cardPreview.getComponent(cc.Sprite)
        sprite.spriteFrame = this.node.getComponent(cc.Sprite).spriteFrame;
        if (cardPreview.active == true) {
            //cc.log('do Start battle!')
            cardPreview.active = false;
            cardPreview.setSiblingIndex(0)
            let action = new DeclareAttackAction({attackedMonster:this})
            let serverData = {signal:Signal.DECLAREATTACK,srvData:{attackedMonsterId:this.node.getComponent(Card).cardId}}
            ActionManager.doAction(action,serverData);
         //   this.attackAMonster()
        } else {
            cardPreview.opacity = 0;
            cardPreview.active = true;
            cardPreview.runAction(cc.fadeIn(0.5))
            cardPreview.setSiblingIndex(cardPreview.parent.childrenCount - 1);
            //for now delay for monster is bigger so you can read, think of something diffrent
            cardPreview.runAction(cc.sequence(cc.delayTime(5), cc.fadeOut(2)))
            this.scheduleOnce(() => {
                cardPreview.active = false;
                cardPreview.setSiblingIndex(0)
            },7)


        }
    }

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
