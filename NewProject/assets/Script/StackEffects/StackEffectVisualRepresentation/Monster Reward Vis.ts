import { STACK_EFFECT_TYPE } from "../../Constants";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";
import { StackEffectVisualRepresentation } from "./Stack Vis Interface";
import Monster from "../../Entites/CardTypes/Monster";

export class MonsterRewardVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame = StackEffectVisManager.$.monsterRewardSprite;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.MONSTER_REWARD;
    flavorText: string;
    baseSprite: cc.SpriteFrame = StackEffectVisManager.$.monsterBaseSprite;
    hasBeenUpdated: boolean = false;


    constructor(monsterWithReward: Monster) {
        this.flavorText = `${monsterWithReward.name} Reward, ${monsterWithReward.reward.name}`
    }

}