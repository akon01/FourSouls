import DataCollector from "../DataCollector/DataCollector";
import Player from "../../Entites/GameEntities/Player";
import MonsterReward from "./MonsterReward";
import CardManager from "../../Managers/CardManager";
import Deck from "../../Entites/GameEntities/Deck";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TreasureCards extends MonsterReward {
  @property({
    type: DataCollector,
    override: true
  })
  dataCollector: DataCollector = null;

  @property
  numOfIemsToGet: number = 0;

  async rewardPlayer(playerToReward: cc.Node, sendToServer: boolean) {
    //cc.log('hush is dead reward player')
    let treasureDeck = CardManager.treasureDeck.getComponent(Deck);
    for (let i = 0; i < this.numOfIemsToGet; i++) {
      //cc.log('start get item ' + i)
      let over = await playerToReward.getComponent(Player).addItem(treasureDeck.drawnCard, sendToServer, true)
      //cc.log('end get item ' + i)
    }
    return new Promise((resolve, reject) => resolve(true))
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
