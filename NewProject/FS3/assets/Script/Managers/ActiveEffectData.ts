
import { _decorator, Component, Node, error } from 'cc';
import { TARGETTYPE } from '../Constants';
import { ServerEffect } from '../Entites/ServerCardEffect';
import { EffectData } from './EffectData';
import { IEffectTarget } from './EffectTarget';
const { ccclass, property } = _decorator;

@ccclass('ActiveEffectData')
export class ActiveEffectData extends EffectData {

    effectOriginPlayer!: Node;
    cardEffect!: ServerEffect;
    numberRolled!: number;

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
        else if (targetType != TARGETTYPE.STACK_EFFECT) {
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
        error("no target was found")
        return null
    }

}