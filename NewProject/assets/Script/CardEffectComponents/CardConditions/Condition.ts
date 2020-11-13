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
    debugger
    this.setConditionId();
  }

  @property({ type: cc.Integer, step: 1 })
  conditionId: number = -1;
  isAddPassiveEffect: boolean = false;;
  events: Array<import("../../Constants").PASSIVE_EVENTS> = [];
  event: import("../../Constants").PASSIVE_EVENTS;
  conditionData: ActiveEffectData | PassiveEffectData;
  dataCollector: import("../DataCollector/DataCollector").default;
  @property({ type: IdAndName, multiline: true })
  dataCollectorId: IdAndName = null

  getDataCollector() {
    return this.node.getComponent(CardEffect).getDataCollector(this.dataCollectorId.id)
  }
  needsDataCollector: boolean = true
  setConditionId() {
    if (this.node && this.conditionId == -1) {
      const comps = this.node.getComponents(Condition);
      this.conditionId = comps.findIndex(ed => ed == this);
    }
  }

  async testCondition(data?: any): Promise<boolean> {
    return false;
  }
}
