import { REWARD_TYPES } from "../../Constants";
import Deck from "../../Entites/GameEntities/Deck";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import DataCollector from "../DataCollector/DataCollector";
import MonsterReward from "./MonsterReward";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TreasureCards extends MonsterReward {

  @property({ override: true })
  hasRoll: boolean = false

  rollNumber: number = 0;

  type: REWARD_TYPES = REWARD_TYPES.treasure

  @property
  numOfIemsToGet: number = 0;

  setRewardQuantity(number: number) {
    this.numOfIemsToGet = number
  }

  async rewardPlayer(playerToReward: cc.Node, sendToServer: boolean) {
    if (this.doubleReward) {
      this.numOfIemsToGet += this.numOfIemsToGet
    }
    const treasureDeck = CardManager.treasureDeck.getComponent(Deck);
    for (let i = 0; i < this.numOfIemsToGet; i++) {

      const over = await playerToReward.getComponent(Player).addItem(treasureDeck.node, sendToServer, true)

    }
    return new Promise((resolve, reject) => resolve(true))
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
