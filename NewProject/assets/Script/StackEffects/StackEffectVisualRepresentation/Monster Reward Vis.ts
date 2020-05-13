import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";
import { StackEffectVisualRepresentation } from "./Stack Vis Interface";
import Monster from "../../Entites/CardTypes/Monster";
import Card from "../../Entites/GameEntities/Card";

export class MonsterRewardVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame = StackEffectVisManager.$.monsterRewardSprite;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.MONSTER_REWARD;
    flavorText: string;
    baseSprite: cc.SpriteFrame = StackEffectVisManager.$.monsterBaseSprite;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = null


    constructor(monsterWithReward: Monster) {
        this.flavorText = `${monsterWithReward.name} Reward, ${monsterWithReward.reward.name}`
        switch (monsterWithReward.node.getComponent(Card).souls) {
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