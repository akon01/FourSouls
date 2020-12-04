import ConditionInterface from "./ConditionInterface";
import { PassiveEffectData, ActiveEffectData } from "../../Managers/DataInterpreter";
import DataCollector from "../DataCollector/DataCollector";
import IdAndName from "../IdAndNameComponent";
import CardEffect from "../../Entites/CardEffect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Condition extends cc.Component
  implements ConditionInterface {

  resetInEditor() {
    this.setConditionId();
  }

  setWithOld(data) {

  }

  newCompCondition: Condition = null

  @property({ type: cc.Integer, step: 1 })
  ConditionId: number = -1;
  isAddPassiveEffect: boolean = false;;
  events: Array<import("../../Constants").PASSIVE_EVENTS> = [];
  event: import("../../Constants").PASSIVE_EVENTS;
  conditionData: ActiveEffectData | PassiveEffectData;
  @property(DataCollector)
  dataCollector: import("../DataCollector/DataCollector").default;
  @property({ type: IdAndName, multiline: true })
  dataCollectorId: IdAndName = null
  @property(cc.Integer)
  dataCollectorIdFinal: number = -1

  getDataCollector() {
    if (this.dataCollectorId) {
      return this.node.getComponent(CardEffect).getDataCollector(this.dataCollectorId.id)
    }
    return null
  }
  needsDataCollector: boolean = true
  setConditionId() {
    if (this.node && this.ConditionId == -1) {
      const comps = this.node.getComponents(Condition);
      this.ConditionId = comps.findIndex(ed => ed == this);
    }
  }

  async testCondition(data?: any): Promise<boolean> {
    return false;
  }
}
