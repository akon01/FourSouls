import { COLLECTORTYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwner extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "CardOwner";

  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data) {

    let player = PlayerManager.getPlayerByCard(this.node.parent.parent)
    let data2 = { target: player.playerId };
    return data2;
  }
}
