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
  numOfMoneyToAdd: number = 0;

  rewardPlayer(playerToReward: cc.Node, sendToServer: boolean) {
    playerToReward.getComponent(Player).changeMoney(this.numOfMoneyToAdd, sendToServer)
    return new Promise((resolve, reject) => resolve(true))

  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
