import { _decorator, Enum, CCBoolean, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

import { REWARD_TYPES } from "../../Constants";

@ccclass('MonsterRewardDescription')
export class MonsterRewardDescription {
    @property({ type: Enum(REWARD_TYPES) })
    rewardType: REWARD_TYPES = REWARD_TYPES.loot
    @property(CCBoolean)
    hasRoll: boolean = false;
    @property(CCInteger)
    rollNumber: number = 0
    @property(CCInteger)
    quantity: number = 0;
    @property(CCBoolean)
    doubleReward: boolean = false
}

