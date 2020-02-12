import { StackEffectVisualRepresentation } from "./Stack Vis Interface";
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import Stack from "../../Entites/Stack";

export class PlayLootCardVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PLAY_LOOT_CARD;
    flavorText: string;
    baseSprite: cc.SpriteFrame = null;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.BASIC



    constructor(cardSprite: cc.SpriteFrame) {
        this.baseSprite = cardSprite;

    }

}