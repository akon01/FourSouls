
import { COLLECTORTYPE, CARD_TYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";
import Player from "../../Entites/GameEntities/Player";
import { EffectTarget } from "../../Managers/DataInterpreter";
import CardManager from "../../Managers/CardManager";



const { ccclass, property } = cc._decorator;

@ccclass
export default class ADeck extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'ADeck';


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
                return new EffectTarget(CardManager.lootDeck)
            case CARD_TYPE.MONSTER:
                return new EffectTarget(CardManager.monsterDeck)
            case CARD_TYPE.TREASURE:
                return new EffectTarget(CardManager.treasureDeck)
            default:
                break;
        }
    }

}
