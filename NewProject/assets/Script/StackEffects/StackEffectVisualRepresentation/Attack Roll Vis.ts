import { StackEffectVisualRepresentation } from "./Stack Vis Interface";
import { STACK_EFFECT_TYPE } from "../../Constants";
import Stack from "../../Entites/Stack";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";

export class AttackRollVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ATTACK_ROLL;
    flavorText: string;
    baseSprite: cc.SpriteFrame = StackEffectVisManager.$.monsterBaseSprite;
    hasBeenUpdated: boolean = false;


    constructor(diceSprite: cc.SpriteFrame, flavorText: string) {
        this.extraSprite = diceSprite
        this.flavorText = flavorText
    }


}