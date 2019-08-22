import { STACK_EFFECT_TYPE } from "../../Constants";

export class StackEffectVisBasic {

    stackEffectType: STACK_EFFECT_TYPE;
    flavorText: string
    baseSprite: cc.SpriteFrame
    extraSprite: cc.SpriteFrame
    hasBeenUpdated: boolean

    constructor(type: STACK_EFFECT_TYPE, flavor: string, baseFrame: cc.SpriteFrame, extraFrame: cc.SpriteFrame) {
        this.stackEffectType = type;
        this.flavorText = flavor;
        this.baseSprite = baseFrame;
        this.extraSprite = extraFrame;
        this.hasBeenUpdated = false
    }

}