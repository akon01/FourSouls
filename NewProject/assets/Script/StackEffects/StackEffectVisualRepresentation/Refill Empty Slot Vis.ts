import { CARD_TYPE, STACK_EFFECT_TYPE } from "../../Constants";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";
import { StackEffectVisualRepresentation } from "./Stack Vis Interface";

export class RefillEmptySlotVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.REFILL_EMPTY_SLOT;
    flavorText: string;
    baseSprite: cc.SpriteFrame = StackEffectVisManager.$.happeningBaseSprite;
    hasBeenUpdated: boolean = false;


    constructor(slotType: CARD_TYPE) {
        if (slotType == CARD_TYPE.MONSTER) {

            this.flavorText = `Refilling monster slot`
        } else {
            this.flavorText = `Refilling store slot`
        }
    }



}