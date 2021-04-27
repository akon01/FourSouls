import { _decorator } from 'cc';
import { COLLECTORTYPE } from "../../Constants";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from "./DataCollector";
const { ccclass, property } = _decorator;


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
        const monster = WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntityNode
        if (!monster) { debugger; throw new Error("No Monster Being Attacked!"); }

        const effectTarget = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(monster)
        return effectTarget
    }
}
