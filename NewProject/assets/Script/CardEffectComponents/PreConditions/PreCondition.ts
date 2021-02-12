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

  setWithOld(old: PreCondition) {

  }

  @property({ type: cc.Integer, step: 1 })
  PreConditionId: number = -1

  @property({ type: cc.Integer, multiline: true })
  dataCollectorIdFinal: number = -1;

  getDataCollector() {
    return this.node.getComponent(CardEffect).getDataCollector(this.dataCollectorIdFinal)
  }

  conditionData: any;
  setPreConditionId() {
    if (this.node && this.PreConditionId == -1) {
      const comps = this.node.getComponents(PreCondition);
      this.PreConditionId = comps.findIndex(ed => ed == this);
    }
  }

  testCondition(data?: any): boolean {
    return null;
  }
}
