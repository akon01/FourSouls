import { COLLECTORTYPE, COLORS } from "../../Constants";
import DataCollectorInterface from "./DataCollectorInterface";
import Cost from "../Costs/Cost";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DataCollector extends cc.Component implements DataCollectorInterface {
  private _isCardChosen: boolean = false;
  set isCardChosen(boolean: boolean) {
    this._isCardChosen = boolean
  }
  private _isEffectChosen: boolean = false;
  set isEffectChosen(boolean: boolean) {
    this._isEffectChosen = boolean
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
