import { _decorator, SpriteFrame } from 'cc';
import { StackEffectVisualRepresentation } from "./StackVisInterface";
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import { Stack } from "../../Entites/Stack";

export class PlayLootCardVis implements StackEffectVisualRepresentation {
    extraSprite!: SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PLAY_LOOT_CARD;
    flavorText!: string;
    baseSprite: SpriteFrame | null = null;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.BASIC



    constructor(cardSprite: SpriteFrame) {
        this.baseSprite = cardSprite;

    }

}