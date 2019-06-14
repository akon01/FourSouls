import DataCollector from "../DataCollector/DataCollector";
import Player from "../../Entites/GameEntities/Player";
import MonsterReward from "./MonsterReward";
import CardManager from "../../Managers/CardManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LootCards extends MonsterReward {
  @property({
    type: DataCollector,
    override: true
  })
  dataCollector: DataCollector = null;

  @property
  numOfCardsToLoot: number = 0;

  rewardPlayer(playerToReward: cc.Node) {
    let lootDeck = CardManager.lootDeck;
    for (let i = 0; i < this.numOfCardsToLoot; i++) {
      playerToReward.getComponent(Player).drawCard(lootDeck, true);
    }
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {}

  // update (dt) {}
}
