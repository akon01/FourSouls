import DataCollector from "../DataCollector/DataCollector";
import Player from "../../Entites/GameEntities/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterReward extends cc.Component {
  @property(DataCollector)
  dataCollector: DataCollector = null;

  rewardPlayer(playerToReward: cc.Node, sendToServer: boolean) { }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
