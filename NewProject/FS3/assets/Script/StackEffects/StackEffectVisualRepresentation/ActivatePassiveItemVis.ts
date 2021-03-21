import { _decorator, SpriteFrame, Node, Sprite } from 'cc';
import { BaseStackEffectVisualRepresentation, StackEffectVisualRepresentation } from "./StackVisInterface";
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import { Stack } from "../../Entites/Stack";
import { Monster } from "../../Entites/CardTypes/Monster";

export class ActivatePassiveItemVis extends BaseStackEffectVisualRepresentation {
    extraSprite: SpriteFrame | undefined;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ACTIVATE_ITEM;
    flavorText!: string;
    baseSprite: SpriteFrame | null = null;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.BASIC
    constructor(cardWithEffect: Node, cardSprite: Sprite) {
        super()
        this.baseSprite = cardSprite.spriteFrame;
        // let monster = cardWithEffect.getComponent(Monster);
        // if (monster != null) {
        //     switch (monster.souls) {
        //         case 0:
        //             this.visType = STACK_EFFECT_VIS_TYPE.MONSTER_ACTION
        //             break;
        //         case 1:
        //             this.visType = STACK_EFFECT_VIS_TYPE.BOSS_ACTION
        //             break;
        //         case 2:
        //             this.visType = STACK_EFFECT_VIS_TYPE.MEGA_BOSS_ACTION
        //             break
        //         default:
        //             break;
        //     }
        // } else {
        this.visType = STACK_EFFECT_VIS_TYPE.BASIC
        //  }

    }
}
