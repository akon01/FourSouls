import DataCollector from "../DataCollector/DataCollector";
import Player from "../../Entites/GameEntities/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterReward extends cc.Component {
  @property(DataCollector)
  dataCollector: DataCollector = null;

  async rewardPlayer(playerToReward: cc.Node, sendToServer: boolean): Promise<any> { }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
