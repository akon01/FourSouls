import { STACK_EFFECT_TYPE } from "../../Constants";

export interface StackEffectVisualRepresentation {

    stackEffectType: STACK_EFFECT_TYPE;
    flavorText: string
    baseSprite: cc.SpriteFrame
    extraSprite: cc.SpriteFrame
    hasBeenUpdated: boolean

}