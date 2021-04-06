
import { Node, _decorator } from 'cc';
import { TARGETTYPE } from '../Constants';
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';
import { IEffectTarget } from "./IEffectTarget";
import { EffectTargetFactory } from './EffectTargetFactory';
import { IEffectData } from './IEffectData.1';
import { WrapperProvider } from './WrapperProvider';
import { Effect } from '../CardEffectComponents/CardEffects/Effect';

// interface IEffectTarget {
//     targetType: any,
//     effectTargetStackEffectId: any,
//     effectTargetCard: any

// }

// class EffectTarget implements IEffectTarget {
//     targetType: any = null
//     effectTargetStackEffectId: any = null
//     effectTargetCard: any = null


//     /**
//      *
//      */
//     constructor(s: any) {


//     }
// }

const { ccclass, property } = _decorator;

@ccclass("EffectData")
export class EffectData implements IEffectData {
    effectCard!: Node;
    effectCardOwner!: Node;
    effectCardPlayer!: Node | null;
    chainEffectsData: Array<{ effectIndex: number, data: IEffectData[] }> = [];
    effectTargets: IEffectTarget[] = [];


    getAllTargets() {
        const targets: { nodes: Node[], stackEffects: StackEffectInterface[], effects: Effect[], numbers: number[] } = { nodes: [], stackEffects: [], effects: [], numbers: [] }
        for (const target of this.effectTargets) {
            if (target.targetType == TARGETTYPE.STACK_EFFECT) {
                targets.stackEffects.push(target.effectTargetStackEffectId)
            } else if (target.targetType == TARGETTYPE.EFFECT) {
                targets.effects.push(target.effectTargetEffect)
            } else if (target.targetType == TARGETTYPE.NUMBER) {

                targets.numbers.push(target.effectTargetNumber)
            } else {
                targets.nodes.push(target.effectTargetCard)
            }
        }
        return targets
    }

    addTarget(target: IEffectTarget | IEffectTarget[] | Node) {
        if (target instanceof Node) {
            const newTarget = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(target)
            this.effectTargets.push(newTarget)
        } else
            if (Array.isArray(target)) {
                target.forEach(inTarget => {
                    this.addTarget(inTarget)
                });
            } else {
                this.effectTargets.push(target)
            }
    }
}

