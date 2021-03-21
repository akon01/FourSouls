
import { Node, _decorator } from 'cc';
import { TARGETTYPE } from '../Constants';
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';
import { EffectTarget, IEffectTarget } from './EffectTarget';


const { ccclass, property } = _decorator;

interface IEffectData {
    effectCard: Node;
    effectCardOwner: Node;
    effectCardPlayer: Node | null;
    chainEffectsData: Array<{ effectIndex: number, data: EffectData[] }>;
    effectTargets: IEffectTarget[];
    getAllTargets(): {
        nodes: Node[];
        stackEffects: StackEffectInterface[];
    }
}

export type { IEffectData }

@ccclass("EffectData")
export class EffectData {
    effectCard!: Node;
    effectCardOwner!: Node;
    effectCardPlayer!: Node | null;
    chainEffectsData: Array<{ effectIndex: number, data: EffectData[] }> = [];
    effectTargets: IEffectTarget[] = [];


    getAllTargets() {
        const targets: { nodes: Node[], stackEffects: StackEffectInterface[] } = { nodes: [], stackEffects: [] }
        for (const target of this.effectTargets) {
            if (target.targetType == TARGETTYPE.STACK_EFFECT) {
                targets.stackEffects.push(target.effectTargetStackEffectId)
            } else {
                targets.nodes.push(target.effectTargetCard)
            }
        }
        return targets
    }

    addTarget(target: EffectTarget | EffectTarget[] | Node) {
        if (Array.isArray(target)) {
            target.forEach(inTarget => {
                this.addTarget(inTarget)
            });
        } else if (target instanceof EffectTarget) {
            this.effectTargets.push(target)
        } else {
            const newTarget = new EffectTarget(target);
            this.effectTargets.push(newTarget)
        }
    }
}