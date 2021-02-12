import CardEffect from "../../Entites/CardEffect";
import PlayerManager from "../../Managers/PlayerManager";
import Effect from "../CardEffects/Effect";
import Cost from "./Cost";


const { ccclass, property } = cc._decorator;

@ccclass('DestroyThisCost')
export default class DestroyThisCost extends Cost {

    async takeCost() {
        let thisEffect = this.node.getComponent(CardEffect).getAllEffects().find(effect => effect.costIdFinal !== null && effect.costIdFinal == this.CostId);
        let thisCard = thisEffect._effectCard
        let player = PlayerManager.getPlayerByCard(thisCard)
        await player.destroyItem(thisCard, true)
    }



}
