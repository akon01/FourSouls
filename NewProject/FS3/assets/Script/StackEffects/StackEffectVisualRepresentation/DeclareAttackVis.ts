import { _decorator, SpriteFrame, Node } from 'cc';
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import { StackEffectVisManager } from "../../Managers/StackEffectVisManager";
import { BaseStackEffectVisualRepresentation, StackEffectVisualRepresentation } from "./StackVisInterface";
import { Player } from "../../Entites/GameEntities/Player";
import { WrapperProvider } from '../../Managers/WrapperProvider';

export class DeclareAttackVis extends BaseStackEffectVisualRepresentation {
    extraSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.combatDamageToBe!;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.DECLARE_ATTACK;
    flavorText!: string;
    baseSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.happeningBaseSprite!;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.PLAYER_ACTION
    constructor(attackingPlayer: Player, monsterBeingAttacked: Node, monsterToAttack: SpriteFrame) {
        super()
    }
}

