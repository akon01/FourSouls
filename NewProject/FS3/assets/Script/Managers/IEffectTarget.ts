import { Node } from 'cc';
import { TARGETTYPE } from '../Constants';
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';

interface IEffectTarget {
    effectTargetStackEffectId: StackEffectInterface;
    effectTargetCard: Node;
    effectTargetNumber: number;
    targetType: TARGETTYPE;
    getTargetCardType(targetNode: Node): TARGETTYPE;
}
export type { IEffectTarget };
