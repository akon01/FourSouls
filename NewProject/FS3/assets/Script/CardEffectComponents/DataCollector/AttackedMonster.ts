import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { COLLECTORTYPE } from "../../Constants";
import { BattleManager } from "../../Managers/BattleManager";
import { EffectTarget } from "../../Managers/EffectTarget";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from "./DataCollector";

@ccclass('AttackedMonster')
export class AttackedMonster extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'AttackedMonster';
    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data: any) {
        let monster = WrapperProvider.battleManagerWrapper.out.currentlyAttackedMonsterNode
        if (!monster) { debugger; throw new Error("No Monster Being Attacked!"); }

        let effectTarget = new EffectTarget(monster)
        return effectTarget
    }
}
