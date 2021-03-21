import { _decorator, SpriteFrame } from 'cc';
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";

export interface StackEffectVisualRepresentation {

    stackEffectType: STACK_EFFECT_TYPE;
    flavorText: string
    baseSprite: SpriteFrame | null
    extraSprite: SpriteFrame | undefined
    hasBeenUpdated: boolean
    visType: STACK_EFFECT_VIS_TYPE

}

export class BaseStackEffectVisualRepresentation implements StackEffectVisualRepresentation {
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ACTIVATE_ITEM;
    flavorText: string = "";
    baseSprite: SpriteFrame | null = null;
    extraSprite: SpriteFrame | undefined;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.BASIC;



















    /**
     *
     */
    constructor() {


    }
}