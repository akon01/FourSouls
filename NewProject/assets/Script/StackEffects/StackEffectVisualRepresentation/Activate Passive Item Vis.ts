import { StackEffectVisualRepresentation } from "./Stack Vis Interface";
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import Stack from "../../Entites/Stack";
import Monster from "../../Entites/CardTypes/Monster";

export class ActivatePassiveItemVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ACTIVATE_ITEM;
    flavorText: string;
    baseSprite: cc.SpriteFrame = null;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = null


    constructor(cardWithEffect: cc.Node, cardSprite: cc.Sprite) {
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