import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Card } from "../../Entites/GameEntities/Card";
import { PlayerManager } from "../../Managers/PlayerManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Cost } from "./Cost";

@ccclass('PayMoneyCost')
export class PayMoneyCost extends Cost {
    @property
    moneyToPay: number = 1;
    async takeCost() {
        const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
        const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!
        await cardOwner.changeMoney(-this.moneyToPay, true)
    }
}
