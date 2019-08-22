import DataCollector from "../DataCollector/DataCollector";
import Player from "../../Entites/GameEntities/Player";
import MonsterReward from "./MonsterReward";
import CardManager from "../../Managers/CardManager";
import Deck from "../../Entites/GameEntities/Deck";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TreasureCards extends MonsterReward {

  @property({ override: true })
  hasRoll: boolean = false

  rollNumber: number = 0;

  @property
  numOfIemsToGet: number = 0;

  async rewardPlayer(playerToReward: cc.Node, sendToServer: boolean) {

    let treasureDeck = CardManager.treasureDeck.getComponent(Deck);
    for (let i = 0; i < this.numOfIemsToGet; i++) {

      let over = await playerToReward.getComponent(Player).addItem(treasureDeck.topBlankCard, sendToServer, true)

    }
    return new Promise((resolve, reject) => resolve(true))
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
