import PreConditionInterface from "./PreConditionInterface";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PreCondition extends cc.Component
  implements PreConditionInterface {
  resetInEditor() {
    this.setPreConditionId();
  }
  @property
  preConditionId: number
  dataCollector: import("../DataCollector/DataCollector").default;
  dataCollectorId: number;
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
