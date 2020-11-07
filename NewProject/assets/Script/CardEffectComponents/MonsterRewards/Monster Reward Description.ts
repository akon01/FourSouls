import { REWARD_TYPES } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass("MonsterRewardDescription")
export default class MonsterRewardDescription {

    @property({ type: cc.Enum(REWARD_TYPES) })
    rewardType: REWARD_TYPES = REWARD_TYPES.loot

    @property(cc.Boolean)
    hasRoll: boolean = false;

    @property(cc.Integer)
    rollNumber: number = 0

    @property(cc.Integer)
    quantity: number = 0;

    @property(cc.Boolean)
    doubleReward: boolean = false


}
