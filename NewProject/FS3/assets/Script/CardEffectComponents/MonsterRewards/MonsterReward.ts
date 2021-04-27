import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { REWARD_TYPES } from "../../Constants";

@ccclass('MonsterReward')
export class MonsterReward extends Component {
  @property({ override: true })
  hasRoll = false
  type: REWARD_TYPES = REWARD_TYPES.loot
  rollNumber = 0;
  doubleReward = false;
  attachedToCardId = 0
  setRewardQuantity(a: any) {

  }
  async rewardPlayer(playerToReward: Node, sendToServer: boolean): Promise<any | void> { }



















}
