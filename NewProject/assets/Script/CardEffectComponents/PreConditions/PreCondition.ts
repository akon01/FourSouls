import CardEffect from "../../Entites/CardEffect";
import IdAndName from "../IdAndNameComponent";
import PreConditionInterface from "./PreConditionInterface";


const { ccclass, property } = cc._decorator;

@ccclass("PreCondition")
export default class PreCondition extends cc.Component
  implements PreConditionInterface {
  resetInEditor() {
    this.setPreConditionId();
  }

  @property({ type: cc.Integer, step: 1 })
  preConditionId: number = -1
  dataCollector: import("../DataCollector/DataCollector").default;
  @property({ type: IdAndName, multiline: true })
  dataCollectorId: IdAndName = null;

  getDataCollector() {
    return this.node.getComponent(CardEffect).getDataCollector(this.dataCollectorId.id)
  }

  conditionData: any;
  setPreConditionId() {
    if (this.node && this.preConditionId == -1) {
      const comps = this.node.getComponents(PreCondition);
      this.preConditionId = comps.findIndex(ed => ed == this);
    }
  }

  testCondition(data?: any): boolean {
    return null;
  }
}
