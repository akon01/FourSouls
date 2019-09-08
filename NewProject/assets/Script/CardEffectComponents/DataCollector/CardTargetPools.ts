
import { CARD_POOLS, COLLECTORTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import MonsterField from "../../Entites/MonsterField";
import { EffectTarget } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";



const { ccclass, property } = cc._decorator;

@ccclass
export default class CardTargetPools extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'CardTargetPools';

    @property({ type: cc.Enum(CARD_POOLS) })
    targetPool: CARD_POOLS = 1;

    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data) {

        switch (this.targetPool) {
            case CARD_POOLS.ACTIVE_MONSTERS:
                return MonsterField.activeMonsters.map(monster => new EffectTarget(monster))
            case CARD_POOLS.YOUR_HAND:
                return PlayerManager.mePlayer.getComponent(Player).handCards.map(card => new EffectTarget(card))
            case CARD_POOLS.ALL_PLAYERS:
                return PlayerManager.players.map(player => new EffectTarget(player.getComponent(Player).character))
            default:
                break;
        }


    }

}
