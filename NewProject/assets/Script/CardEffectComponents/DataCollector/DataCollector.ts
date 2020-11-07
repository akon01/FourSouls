import { COLLECTORTYPE, COLORS } from "../../Constants";
import DataCollectorInterface from "./DataCollectorInterface";
import Cost from "../Costs/Cost";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DataCollector extends cc.Component implements DataCollectorInterface {
  isCardChosen: boolean = false
  isEffectChosen: boolean = false

  setIsCardChosen(is: boolean) {
    this.isCardChosen = is
  }

  setIsEffectChosen(is: boolean) {
    this.isEffectChosen = is
  }

  cardChosen: cc.Node;
  collectorName = "CardPlayer";
  hasSubAction: boolean = false;

  @property(Cost)
  cost: Cost = null;

  /**
   *
   * @param data {playerId:Player who played the card}
   */
  collectData(data) {
    return data.playerId;
  }
}
