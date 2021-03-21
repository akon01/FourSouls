import { _decorator, SpriteFrame } from 'cc';
import { BaseStackEffectVisualRepresentation, StackEffectVisualRepresentation } from "./StackVisInterface";
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import { Stack } from "../../Entites/Stack";
import { StackEffectVisManager } from "../../Managers/StackEffectVisManager";
import { Player } from "../../Entites/GameEntities/Player";
import { WrapperProvider } from '../../Managers/WrapperProvider';

export class AttackRollVis extends BaseStackEffectVisualRepresentation {
    extraSprite: SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ATTACK_ROLL;
    flavorText: string;
    baseSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.diceRollBaseSprite!;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.BASIC
    constructor(rollingPlayer: Player, diceSprite: SpriteFrame, flavorText: string) {
        super()
        this.extraSprite = diceSprite
        this.flavorText = flavorText
    }
}
