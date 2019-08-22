import { StackEffectVisualRepresentation } from "./Stack Vis Interface";
import { STACK_EFFECT_TYPE } from "../../Constants";
import Stack from "../../Entites/Stack";

export class ActivateItemVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ACTIVATE_ITEM;
    flavorText: string;
    baseSprite: cc.SpriteFrame = null;
    hasBeenUpdated: boolean = false;



    constructor(cardSprite: cc.SpriteFrame) {
        this.baseSprite = cardSprite;

    }

}