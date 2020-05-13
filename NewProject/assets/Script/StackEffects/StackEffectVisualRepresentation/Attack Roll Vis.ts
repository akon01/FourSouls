import { StackEffectVisualRepresentation } from "./Stack Vis Interface";
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import Stack from "../../Entites/Stack";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";
import Player from "../../Entites/GameEntities/Player";

export class AttackRollVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ATTACK_ROLL;
    flavorText: string;
    baseSprite: cc.SpriteFrame = StackEffectVisManager.$.diceRollBaseSprite;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.BASIC


    constructor(rollingPlayer: Player, diceSprite: cc.SpriteFrame, flavorText: string) {
        this.extraSprite = diceSprite
        this.flavorText = flavorText
    }


}