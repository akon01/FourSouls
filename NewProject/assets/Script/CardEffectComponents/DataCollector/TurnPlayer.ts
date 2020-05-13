
import { COLLECTORTYPE } from "../../Constants";
import BattleManager from "../../Managers/BattleManager";
import { EffectTarget } from "../../Managers/DataInterpreter";
import DataCollector from "./DataCollector";
import TurnsManager from "../../Managers/TurnsManager";



const { ccclass, property } = cc._decorator;

@ccclass
export default class TurnPlayer extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'TurnPlayer';

    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data) {
        const player = TurnsManager.getCurrentTurn().getTurnPlayer()
        const effectTarget = new EffectTarget(player.character)
        return effectTarget
    }

}
