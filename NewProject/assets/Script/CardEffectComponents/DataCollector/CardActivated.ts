import { COLLECTORTYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardActivated extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "CardActivated";

  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data) {
    let data2 = { target: data.cardId };
    return data2;
  }
}
