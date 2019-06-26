import { COLLECTORTYPE, printMethodStarted, COLORS } from "../../Constants";
import DataCollectorInterface from "./DataCollectorInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DataCollector extends cc.Component
  implements DataCollectorInterface {
  isCardChosen: boolean = false;
  cardChosen: cc.Node;
  collectorName = "CardPlayer";
  hasSubAction: boolean = false;

  /**
   *
   * @param data {playerId:Player who played the card}
   */
  collectData(data) {
    return data.playerId;
  }
}
