import { _decorator, Enum, CCBoolean, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

import { REWARD_TYPES } from "../../Constants";

@ccclass('MonsterRewardDescription')
export class MonsterRewardDescription {
    @property({ type: Enum(REWARD_TYPES) })
    rewardType: REWARD_TYPES = REWARD_TYPES.loot
    @property(CCBoolean)
    hasRoll = false;
    @property(CCInteger)
    rollNumber = 0
    @property(CCInteger)
    quantity = 0;
    @property(CCBoolean)
    doubleReward = false
}

