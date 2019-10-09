
import { CARD_TYPE, COLLECTORTYPE } from "../../Constants";
import Deck from "../../Entites/GameEntities/Deck";
import CardManager from "../../Managers/CardManager";
import { EffectTarget } from "../../Managers/DataInterpreter";
import DataCollector from "./DataCollector";



const { ccclass, property } = cc._decorator;

@ccclass
export default class TopCardOfDeck extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'TopCardOfDeck';


    @property({ type: cc.Enum(CARD_TYPE) })
    deckType: CARD_TYPE = CARD_TYPE.LOOT

    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data) {
        switch (this.deckType) {
            case CARD_TYPE.LOOT:
                return new EffectTarget(CardManager.lootDeck.getComponent(Deck)._cards[CardManager.lootDeck.getComponent(Deck)._cards.length - 1])
            case CARD_TYPE.MONSTER:
                return new EffectTarget(CardManager.monsterDeck.getComponent(Deck)._cards[CardManager.monsterDeck.getComponent(Deck)._cards.length - 1])
            case CARD_TYPE.TREASURE:
                return new EffectTarget(CardManager.treasureDeck.getComponent(Deck)._cards[CardManager.treasureDeck.getComponent(Deck)._cards.length - 1])
            default:
                break;
        }
    }

}
