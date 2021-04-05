
import { Node, _decorator } from 'cc';
import { Effect } from '../CardEffectComponents/CardEffects/Effect';
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
import { IEffectTarget } from './IEffectTarget';

export class EffectTarget implements IEffectTarget {


    effectTargetStackEffectId!: StackEffectInterface;
    effectTargetCard!: Node;
    effectTargetNumber!: number
    effectTargetEffect!: Effect
    targetType!: TARGETTYPE;

    getTargetCardType(targetNode: Node) {

        if (targetNode != undefined) {

            if (targetNode.getComponent(Character) != null) { return TARGETTYPE.PLAYER }
            if (targetNode.getComponent(Item) != null) { return TARGETTYPE.ITEM }
            if (targetNode.getComponent(Monster) != null) { return TARGETTYPE.MONSTER }
            if (targetNode.getComponent(Pile) != null) { return TARGETTYPE.PILE }
            if (targetNode.getComponent(Deck) != null) { return TARGETTYPE.DECK }
            if (targetNode.getComponent(Card) != null) { return TARGETTYPE.CARD }
            // if (targetNode.getComponent(Effect) != null) { return TARGETTYPE.EFFECT }
            if (targetNode.getComponent(StackEffectPreview) != null) { return TARGETTYPE.STACK_EFFECT }
        }
        return TARGETTYPE.CARD
    }

}