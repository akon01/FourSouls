
import { COLLECTORTYPE } from "../../Constants";
import BattleManager from "../../Managers/BattleManager";
import { EffectTarget } from "../../Managers/DataInterpreter";
import DataCollector from "./DataCollector";



const { ccclass, property } = cc._decorator;

@ccclass
export default class AttackedMonster extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'AttackedMonster';

    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data) {
        let monster = BattleManager.currentlyAttackedMonsterNode
        let effectTarget = new EffectTarget(monster)
        return effectTarget
    }

}
