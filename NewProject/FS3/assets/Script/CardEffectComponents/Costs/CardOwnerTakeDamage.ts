import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Card } from "../../Entites/GameEntities/Card";
import { PlayerManager } from "../../Managers/PlayerManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Cost } from "./Cost";

@ccclass('CardOwnerTakeDamageCost')
export class CardOwnerTakeDamageCost extends Cost {
    @property
    dmgToTake: number = 1;
    async takeCost() {
        let thisEffect = this.getThisEffect()
        const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
        const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!
        await cardOwner.takeDamage(this.dmgToTake, true, cardOwner.character!)
    }
}