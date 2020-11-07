
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
                const lootDeck = CardManager.lootDeck.getComponent(Deck);
                return new EffectTarget(lootDeck.getCards[lootDeck.getCardsLength() - 1])
            case CARD_TYPE.MONSTER:
                const monsterDeck = CardManager.monsterDeck.getComponent(Deck);
                return new EffectTarget(monsterDeck.getCards[monsterDeck.getCardsLength() - 1])
            case CARD_TYPE.TREASURE:
                const treasueDeck = CardManager.treasureDeck.getComponent(Deck);
                return new EffectTarget(treasueDeck.getCards[treasueDeck.getCardsLength() - 1])
            default:
                break;
        }
    }

}
