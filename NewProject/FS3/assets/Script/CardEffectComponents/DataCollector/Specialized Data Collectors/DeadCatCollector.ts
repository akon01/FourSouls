import { _decorator } from 'cc';
import { COLLECTORTYPE } from "../../../Constants";
import { Card } from '../../../Entites/GameEntities/Card';
import { EffectTargetFactory } from '../../../Managers/EffectTargetFactory';
import { WrapperProvider } from '../../../Managers/WrapperProvider';
import { DiscardLoot } from "../../CardEffects/DiscardLoot";
import { ChooseCard } from "../ChooseCard";
import { DataCollector } from "../DataCollector";
const { ccclass, property } = _decorator;


@ccclass('DeadCatCollector')
export class DeadCatCollector extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'DeadCatCollector';

    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data: any) {
        const card = this.getEffectCard()
        const cardComp = card.getComponent(Card)!
        return WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(cardComp._counters)
    }
}
