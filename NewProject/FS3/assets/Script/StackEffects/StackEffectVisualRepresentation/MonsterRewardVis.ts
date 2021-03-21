import { SpriteFrame } from 'cc';
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { BaseStackEffectVisualRepresentation } from "./StackVisInterface";

export class MonsterRewardVis extends BaseStackEffectVisualRepresentation {
    extraSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.monsterRewardSprite!;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.MONSTER_REWARD;
    flavorText: string;
    baseSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.monsterBaseSprite!;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.BASIC
    constructor(monsterWithReward: Monster) {
        super()
        this.flavorText = `${monsterWithReward.name} Reward, ${monsterWithReward.getReward().name}`
        switch (monsterWithReward.node.getComponent(Card)!.souls) {
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
