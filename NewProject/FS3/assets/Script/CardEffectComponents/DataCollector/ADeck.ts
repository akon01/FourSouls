import { _decorator, Enum } from 'cc';
const { ccclass, property } = _decorator;

import { COLLECTORTYPE, CARD_TYPE } from "../../Constants";
import { PlayerManager } from "../../Managers/PlayerManager";
import { DataCollector } from "./DataCollector";
import { Player } from "../../Entites/GameEntities/Player";
import { EffectTarget } from "../../Managers/EffectTarget";
import { CardManager } from "../../Managers/CardManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { EffectTargetFactory } from '../../Managers/EffectTargetFactory';

@ccclass('ADeck')
export class ADeck extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'ADeck';
    @property({ type: Enum(CARD_TYPE) })
    deckType: CARD_TYPE = CARD_TYPE.LOOT
    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data: any) {
        switch (this.deckType) {
            case CARD_TYPE.LOOT:
                return WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(WrapperProvider.cardManagerWrapper.out.lootDeck)
            case CARD_TYPE.MONSTER:
                return WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(WrapperProvider.cardManagerWrapper.out.monsterDeck)
            case CARD_TYPE.TREASURE:
                return WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(WrapperProvider.cardManagerWrapper.out.treasureDeck)
            default:
                throw new Error("No Deck Type!");
        }
    }
}
