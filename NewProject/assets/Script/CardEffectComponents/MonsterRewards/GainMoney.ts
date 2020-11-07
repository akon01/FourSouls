import DataCollector from "../DataCollector/DataCollector";
import Player from "../../Entites/GameEntities/Player";
import MonsterReward from "./MonsterReward";
import CardManager from "../../Managers/CardManager";
import { REWARD_TYPES } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MoneyReward extends MonsterReward {

  @property({ override: true })
  hasRoll: boolean = false

  rollNumber: number = 0;

  type: REWARD_TYPES = REWARD_TYPES.money

  @property
  numOfMoneyToAdd: number = 0;

  setRewardQuantity(number: number) {
    this.numOfMoneyToAdd = number
  }

  async rewardPlayer(playerToReward: cc.Node, sendToServer: boolean) {
    if (this.doubleReward) {
      this.numOfMoneyToAdd += this.numOfMoneyToAdd
    }
    await playerToReward.getComponent(Player).changeMoney(this.numOfMoneyToAdd, sendToServer)
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
