
import { _decorator, Component, Node } from 'cc';
import { Effect } from '../CardEffectComponents/CardEffects/Effect';
import { TARGETTYPE } from '../Constants';
import { StackEffectConcrete } from '../StackEffects/StackEffectConcrete';
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';
import { StackEffectPreview } from '../StackEffects/StackEffectVisualRepresentation/StackEffectPreview';
import { EffectTarget } from './EffectTarget';
const { ccclass, property } = _decorator;

@ccclass('EffectTargetFactory')
export class EffectTargetFactory extends Component {

    getNewEffectTarget(targetCard: Node | StackEffectPreview | StackEffectInterface | number
        | Effect
    ) {
        const newEffectTarget = new EffectTarget()
        if (targetCard instanceof Node) {
            newEffectTarget.effectTargetCard = targetCard;
            newEffectTarget.targetType = newEffectTarget.getTargetCardType(newEffectTarget.effectTargetCard)!
        }
        if (targetCard instanceof StackEffectPreview) {
            newEffectTarget.effectTargetStackEffectId = targetCard.stackEffect!;
            newEffectTarget.targetType = TARGETTYPE.STACK_EFFECT
        }
        if (targetCard instanceof StackEffectConcrete) {
            newEffectTarget.effectTargetStackEffectId = targetCard;
            newEffectTarget.targetType = TARGETTYPE.STACK_EFFECT
        }
        if (targetCard instanceof Effect) {
            newEffectTarget.effectTargetEffect = targetCard
            newEffectTarget.targetType = TARGETTYPE.EFFECT
        }
        if (typeof (targetCard) == "number") {
            newEffectTarget.effectTargetNumber = targetCard
            newEffectTarget.targetType = TARGETTYPE.NUMBER
        }
        return newEffectTarget
    }


}


