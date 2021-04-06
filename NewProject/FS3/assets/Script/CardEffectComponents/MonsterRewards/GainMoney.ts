import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { DataCollector } from "../DataCollector/DataCollector";
import { Player } from "../../Entites/GameEntities/Player";
import { MonsterReward } from "./MonsterReward";
import { CardManager } from "../../Managers/CardManager";
import { REWARD_TYPES } from "../../Constants";

@ccclass('GainMoney')
export class GainMoney extends MonsterReward {
      @property({ override: true })
      hasRoll = false
      rollNumber = 0;
      type: REWARD_TYPES = REWARD_TYPES.money
      @property
      numOfMoneyToAdd = 0;
      setRewardQuantity(number: number) {
            this.numOfMoneyToAdd = number
      }
      async rewardPlayer(playerToReward: Node, sendToServer: boolean) {
            if (this.doubleReward) {
                  this.numOfMoneyToAdd += this.numOfMoneyToAdd
            }
            await playerToReward.getComponent(Player)!.changeMoney(this.numOfMoneyToAdd, sendToServer)
      }

}
