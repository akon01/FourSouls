import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";

export interface StackEffectVisualRepresentation {

    stackEffectType: STACK_EFFECT_TYPE;
    flavorText: string
    baseSprite: cc.SpriteFrame
    extraSprite: cc.SpriteFrame
    hasBeenUpdated: boolean
    visType: STACK_EFFECT_VIS_TYPE

}