import { _decorator, SpriteFrame } from 'cc';
import { CARD_TYPE, STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import { StackEffectVisManager } from "../../Managers/StackEffectVisManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { BaseStackEffectVisualRepresentation, StackEffectVisualRepresentation } from "./StackVisInterface";

export class RefillEmptySlotVis extends BaseStackEffectVisualRepresentation {
    extraSprite: SpriteFrame | undefined;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.REFILL_EMPTY_SLOT;
    flavorText: string;
    baseSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.happeningBaseSprite!;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.BASIC
    constructor(slotType: CARD_TYPE) {
        super()
        if (slotType == CARD_TYPE.MONSTER) {

            this.flavorText = `Refilling monster slot`
        } else {
            this.flavorText = `Refilling store slot`
        }
    }
}
