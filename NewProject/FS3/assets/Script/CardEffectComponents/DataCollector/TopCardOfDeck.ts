import { _decorator, Enum } from 'cc';
const { ccclass, property } = _decorator;

import { CARD_TYPE, COLLECTORTYPE } from "../../Constants";
import { Deck } from "../../Entites/GameEntities/Deck";
import { CardManager } from "../../Managers/CardManager";
import { EffectTarget } from "../../Managers/EffectTarget";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from "./DataCollector";

@ccclass('TopCardOfDeck')
export class TopCardOfDeck extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'TopCardOfDeck';
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
                const lootDeck = WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck)!;
                return new EffectTarget(lootDeck.getCards()[lootDeck.getCardsLength() - 1])
            case CARD_TYPE.MONSTER:
                const monsterDeck = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!;
                return new EffectTarget(monsterDeck.getCards()[monsterDeck.getCardsLength() - 1])
            case CARD_TYPE.TREASURE:
                const treasueDeck = WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!;
                return new EffectTarget(treasueDeck.getCards()[treasueDeck.getCardsLength() - 1])
            default:
                throw new Error("No Card Type Handler!");

                break;
        }
    }
}