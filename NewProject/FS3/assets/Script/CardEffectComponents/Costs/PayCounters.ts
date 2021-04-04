import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Card } from "../../Entites/GameEntities/Card";
import { Cost } from "./Cost";

@ccclass('PayCounters')
export class PayCounters extends Cost {
    @property
    numOfCounters: number = 1;
    async takeCost() {
        let thisEffect = this.getThisEffect()
        let thisCard = thisEffect.getEffectCard()!
        let cardComp = thisCard.getComponent(Card)!
        await cardComp.putCounter(-this.numOfCounters, true)
        // cardComp._counters -= this.numOfCounters;
    }
}
