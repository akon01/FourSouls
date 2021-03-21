
import { Node, _decorator } from 'cc';
import { TARGETTYPE } from '../Constants';
import { Character } from '../Entites/CardTypes/Character';
import { Item } from '../Entites/CardTypes/Item';
import { Monster } from '../Entites/CardTypes/Monster';
import { Card } from '../Entites/GameEntities/Card';
import { Deck } from '../Entites/GameEntities/Deck';
import { Pile } from '../Entites/Pile';
import { StackEffectConcrete } from '../StackEffects/StackEffectConcrete';
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';
import { StackEffectPreview } from '../StackEffects/StackEffectVisualRepresentation/StackEffectPreview';

interface IEffectTarget {
    effectTargetStackEffectId: StackEffectInterface;
    effectTargetCard: Node;
    effectTargetNumber: number
    targetType: TARGETTYPE;
    getTargetCardType(targetNode: Node): TARGETTYPE
}

export type { IEffectTarget }

const { ccclass, property } = _decorator;
export class EffectTarget implements IEffectTarget {

    constructor(targetCard: Node | StackEffectPreview | StackEffectInterface | number) {
        if (targetCard instanceof Node) {
            this.effectTargetCard = targetCard;
            this.targetType = this.getTargetCardType(this.effectTargetCard)!
        }
        if (targetCard instanceof StackEffectPreview) {
            this.effectTargetStackEffectId = targetCard.stackEffect!;
            this.targetType = TARGETTYPE.STACK_EFFECT
        }
        if (targetCard instanceof StackEffectConcrete) {
            this.effectTargetStackEffectId = targetCard;
            this.targetType = TARGETTYPE.STACK_EFFECT
        }
        if (typeof (targetCard) == "number") {
            this.effectTargetNumber = targetCard
            this.targetType = TARGETTYPE.NUMBER
        }

    }

    effectTargetStackEffectId!: StackEffectInterface;
    effectTargetCard!: Node;
    effectTargetNumber!: number
    targetType!: TARGETTYPE;

    getTargetCardType(targetNode: Node) {

        if (targetNode != undefined) {

            if (targetNode.getComponent(Character) != null) { return TARGETTYPE.PLAYER }
            if (targetNode.getComponent(Item) != null) { return TARGETTYPE.ITEM }
            if (targetNode.getComponent(Monster) != null) { return TARGETTYPE.MONSTER }
            if (targetNode.getComponent(Pile) != null) { return TARGETTYPE.PILE }
            if (targetNode.getComponent(Deck) != null) { return TARGETTYPE.DECK }
            if (targetNode.getComponent(Card) != null) { return TARGETTYPE.CARD }
            if (targetNode.getComponent(StackEffectPreview) != null) { return TARGETTYPE.STACK_EFFECT }
        }
        return TARGETTYPE.CARD
    }

}