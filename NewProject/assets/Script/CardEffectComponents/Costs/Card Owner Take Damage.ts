import CostInterface from "./CostInterface";
import Cost from "./Cost";
import Card from "../../Entites/GameEntities/Card";
import Effect from "../CardEffects/Effect";
import PlayerManager from "../../Managers/PlayerManager";


const { ccclass, property } = cc._decorator;

@ccclass('CardOwnerTakeDamageCost')
export default class CardOwnerTakeDamageCost extends Cost {

    @property
    dmgToTake: number = 1;

    async takeCost() {
        let thisEffect = this.node.parent;
        const thisCard = Card.getCardNodeByChild(this.node)
        const cardOwner = PlayerManager.getPlayerByCard(thisCard)
        await cardOwner.takeDamage(this.dmgToTake, true, cardOwner.character)
    }



}
