import { COLLECTORTYPE, COLORS } from "../../Constants";
import DataCollectorInterface from "./DataCollectorInterface";
import Cost from "../Costs/Cost";
import IdAndName from "../IdAndNameComponent";
import CardEffect from "../../Entites/CardEffect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DataCollector extends cc.Component implements DataCollectorInterface {
  getCost(): Cost {
    return this.node.getComponent(CardEffect).getCost(this.costIdFinal)
  }

  resetInEditor() {
    this.setDataCollectorId();
  }

  setWithOld(oldDataCollector: DataCollector) {

  }

  hasBeenHandled = false

  @property
  DataCollectorId: number = -1

  isCardChosen: boolean = false
  isEffectChosen: boolean = false

  setDataCollectorId() {
    if (this.node && this.DataCollectorId == -1) {
      const comps = this.node.getComponents(DataCollector);
      this.DataCollectorId = comps.findIndex(ed => ed == this);
    }
  }

  setIsCardChosen(is: boolean) {
    this.isCardChosen = is
  }

  setIsEffectChosen(is: boolean) {
    this.isEffectChosen = is
  }

  cardChosen: cc.Node;
  collectorName = "CardPlayer";
  hasSubAction: boolean = false;


  @property({ type: cc.Integer })
  costIdFinal: number = -1

  /**
   *
   * @param data {playerId:Player who played the card}
   */
  collectData(data) {
    return data.playerId;
  }
}
