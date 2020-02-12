import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";
import { StackEffectVisualRepresentation } from "./Stack Vis Interface";
import Monster from "../../Entites/CardTypes/Monster";

export class MonsterDeathVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame = StackEffectVisManager.$.monsterDeathSprite;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.MONSTER_DEATH;
    flavorText: string;
    baseSprite: cc.SpriteFrame = StackEffectVisManager.$.happeningBaseSprite;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = null


    constructor(monster: Monster) {
        this.flavorText = `${monster.name} Death`
        switch (monster.souls) {
            case 0:
                this.visType = STACK_EFFECT_VIS_TYPE.MONSTER_ACTION
                break;
            case 1:
                this.visType = STACK_EFFECT_VIS_TYPE.BOSS_ACTION
                break;
            case 2:
                this.visType = STACK_EFFECT_VIS_TYPE.MEGA_BOSS_ACTION
                break
            default:
                break;
        }
    }

}