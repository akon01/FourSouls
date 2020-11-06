import DataCollector from "../DataCollector/DataCollector";
import Player from "../../Entites/GameEntities/Player";
import MonsterReward from "./MonsterReward";
import CardManager from "../../Managers/CardManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NothingReward extends MonsterReward {



  async rewardPlayer(playerToReward: cc.Node, sendToServer: boolean) {
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
