import { _decorator, SpriteFrame } from 'cc';
import { BaseStackEffectVisualRepresentation, StackEffectVisualRepresentation } from "./StackVisInterface";
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import { Stack } from "../../Entites/Stack";

export class ActivateItemVis extends BaseStackEffectVisualRepresentation {
    extraSprite: SpriteFrame | undefined;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ACTIVATE_ITEM;
    flavorText!: string;
    baseSprite: SpriteFrame | null = null;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.BASIC
    constructor(cardSprite: SpriteFrame) {
        super()
        this.baseSprite = cardSprite;

    }
}


