
import { _decorator } from 'cc';
import { TARGETTYPE } from '../Constants';
import { EffectData } from './EffectData';
import { IEffectTarget } from "./IEffectTarget";


const { ccclass, property } = _decorator;

@ccclass('PassiveEffectData')
export class PassiveEffectData extends EffectData {
    methodArgs: any[] = [];
    terminateOriginal: boolean = false;

    getTargets(targetType: TARGETTYPE) {
        const targets: IEffectTarget[] = []
        if (targetType == TARGETTYPE.CARD) {
            for (const target of this.effectTargets) {
                if (target.targetType != TARGETTYPE.STACK_EFFECT) {
                    targets.push(target)
                }
            }
            return targets.map(target => target.effectTargetCard)
        }
        for (const target of this.effectTargets) {
            if (target.targetType == targetType) {
                targets.push(target)
            }
        }
        if (targetType == TARGETTYPE.NUMBER) {
            return targets.map(t => t.effectTargetNumber)
        }
        else
            if (targetType != TARGETTYPE.STACK_EFFECT) {
                return targets.map(target => target.effectTargetCard);
            } else { return targets.map(target => target.effectTargetStackEffectId); }
    }
    getTarget(targetType: TARGETTYPE) {
        if (targetType == TARGETTYPE.STACK_EFFECT) {
            for (const target of this.effectTargets) {
                if (target.targetType == targetType) {
                    return target.effectTargetStackEffectId
                }
            }
        }
        else if (targetType == TARGETTYPE.NUMBER) {
            return this.effectTargets[this.effectTargets.length - 1].effectTargetNumber
        }
        else if (targetType == TARGETTYPE.CARD) {
            return this.effectTargets[this.effectTargets.length - 1].effectTargetCard
        } else {
            for (const target of this.effectTargets) {
                if (target.targetType == targetType) {
                    return target.effectTargetCard
                }
            }
        }
        return null
    }

}


export type { PassiveEffectData as PassiveEffectDataType }