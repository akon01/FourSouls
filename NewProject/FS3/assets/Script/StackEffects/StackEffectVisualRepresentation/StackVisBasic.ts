import { _decorator, SpriteFrame } from 'cc';
import { STACK_EFFECT_TYPE } from "../../Constants";

export class StackVisBasic {
    stackEffectType: STACK_EFFECT_TYPE;
    flavorText: string
    baseSprite: SpriteFrame
    extraSprite: SpriteFrame
    hasBeenUpdated: boolean
    constructor(type: STACK_EFFECT_TYPE, flavor: string, baseFrame: SpriteFrame, extraFrame: SpriteFrame) {
        this.stackEffectType = type;
        this.flavorText = flavor;
        this.baseSprite = baseFrame;
        this.extraSprite = extraFrame;
        this.hasBeenUpdated = false
    }
}
