import Card from "../../Entites/GameEntities/Card";
import PlayerManager from "../../Managers/PlayerManager";
import Cost from "./Cost";


const { ccclass, property } = cc._decorator;

@ccclass('CardOwnerTakeDamageCost')
export default class CardOwnerTakeDamageCost extends Cost {

    @property
    dmgToTake: number = 1;

    async takeCost() {
        let thisEffect = this.getThisEffect()
        const thisCard = Card.getCardNodeByChild(this.node)
        const cardOwner = PlayerManager.getPlayerByCard(thisCard)
        await cardOwner.takeDamage(this.dmgToTake, true, cardOwner.character)
    }



}
