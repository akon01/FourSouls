import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { DataCollector } from "../DataCollector/DataCollector";
import { Player } from "../../Entites/GameEntities/Player";
import { MonsterReward } from "./MonsterReward";
import { CardManager } from "../../Managers/CardManager";
import { REWARD_TYPES } from "../../Constants";

@ccclass('Nothing')
export class Nothing extends MonsterReward {
  type: REWARD_TYPES = REWARD_TYPES.nothing
  setRewardQuantity(number: number) {

  }
  async rewardPlayer(playerToReward: Node, sendToServer: boolean) {
  }

}
