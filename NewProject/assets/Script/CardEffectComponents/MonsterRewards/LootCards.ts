import DataCollector from "../DataCollector/DataCollector";
import Player from "../../Entites/GameEntities/Player";
import MonsterReward from "./MonsterReward";
import CardManager from "../../Managers/CardManager";
import { REWARD_TYPES } from "../../Constants";


const { ccclass, property } = cc._decorator;

@ccclass
export default class LootCards extends MonsterReward {

  @property({ override: true })
  hasRoll: boolean = false

  rollNumber: number = 0;

  type: REWARD_TYPES = REWARD_TYPES.loot

  @property
  numOfCardsToLoot: number = 0;

  setRewardQuantity(number: number) {
    this.numOfCardsToLoot = number
  }

  async rewardPlayer(playerToReward: cc.Node, sendToServer: boolean) {
    if (this.doubleReward) {
      this.numOfCardsToLoot += this.numOfCardsToLoot
    }
    let lootDeck = CardManager.lootDeck;
    for (let i = 0; i < this.numOfCardsToLoot; i++) {
      let over = await playerToReward.getComponent(Player).drawCard(lootDeck, sendToServer);
    }
    return new Promise((resolve, reject) => resolve(true))
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
