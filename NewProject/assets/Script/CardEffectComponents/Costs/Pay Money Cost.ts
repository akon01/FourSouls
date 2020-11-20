import Card from "../../Entites/GameEntities/Card";
import PlayerManager from "../../Managers/PlayerManager";
import Cost from "./Cost";


const { ccclass, property } = cc._decorator;

@ccclass("PayMoneyCost")
export default class PayMoneyCost extends Cost {

    @property
    moneyToPay: number = 1;

    async takeCost() {
        const thisCard = Card.getCardNodeByChild(this.node)
        const cardOwner = PlayerManager.getPlayerByCard(thisCard)
        await cardOwner.changeMoney(-this.moneyToPay, true)
    }



}
