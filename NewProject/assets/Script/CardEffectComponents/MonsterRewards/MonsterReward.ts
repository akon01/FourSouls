import DataCollector from "../DataCollector/DataCollector";
import Player from "../../Entites/GameEntities/Player";
import { REWARD_TYPES } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterReward extends cc.Component {

  @property({ override: true })
  hasRoll: boolean = false

  type: REWARD_TYPES = REWARD_TYPES.loot

  rollNumber: number = 0;

  doubleReward: boolean = false;

  attachedToCardId: number = 0

  setRewardQuantity(number: number) {

  }

  async rewardPlayer(playerToReward: cc.Node, sendToServer: boolean): Promise<any> { }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
