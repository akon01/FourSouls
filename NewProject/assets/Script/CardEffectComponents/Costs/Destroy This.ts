import PlayerManager from "../../Managers/PlayerManager";
import Effect from "../CardEffects/Effect";
import Cost from "./Cost";


const { ccclass, property } = cc._decorator;

@ccclass('DestroyThisCost')
export default class DestroyThisCost extends Cost {



    async takeCost() {
        let thisEffect = this.node.parent;
        let thisCard = thisEffect.getComponent(Effect)._effectCard
        let player = PlayerManager.getPlayerByCard(thisCard)
        await player.destroyItem(thisCard, true)
    }



}
