import CostInterface from "./CostInterface";
import Cost from "./Cost";
import Card from "../../Entites/GameEntities/Card";
import Effect from "../CardEffects/Effect";
import PlayerManager from "../../Managers/PlayerManager";


const { ccclass, property } = cc._decorator;

@ccclass("PayMoneyCost")
export default class PayMoneyCost extends Cost {

    @property
    moneyToPay: number = 1;

    async takeCost() {
        let thisEffect = this.node.parent;
        const thisCard = Card.getCardNodeByChild(this.node)
        const cardOwner = PlayerManager.getPlayerByCard(thisCard)
        await cardOwner.changeMoney(-this.moneyToPay, true)
    }



}
