import { Node } from 'cc';
import { Effect } from '../CardEffectComponents/CardEffects/Effect';
import { TARGETTYPE } from '../Constants';
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';

interface IEffectTarget {
    effectTargetStackEffectId: StackEffectInterface;
    effectTargetCard: Node;
    effectTargetNumber: number;
    targetType: TARGETTYPE;
    effectTargetEffect: Effect
    getTargetCardType(targetNode: Node): TARGETTYPE;
}
export type { IEffectTarget };
