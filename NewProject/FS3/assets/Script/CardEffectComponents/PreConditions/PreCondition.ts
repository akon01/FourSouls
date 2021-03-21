import { CCInteger, Component, _decorator } from 'cc';
import { CardEffect } from "../../Entites/CardEffect";
import { DataCollector } from '../DataCollector/DataCollector';
import { PreConditionInterface } from "./PreConditionInterface";
const { ccclass, property } = _decorator;


@ccclass('PreCondition')
export class PreCondition extends Component implements PreConditionInterface {
  setWithOld(old: PreCondition) {

  }

  @property({ type: CCInteger, step: 1 })
  PreConditionId: number = -1

  // @property({ type: CCInteger, multiline: true })
  // dataCollectorIdFinal: number = -1;

  @property({ type: Component, multiline: true })
  dataCollector: DataCollector | null = null;

  getDataCollector() {
    return this.dataCollector
    // return this.node.getComponent(CardEffect)!.getDataCollector(this.dataCollectorIdFinal)
  }

  conditionData: any;
  setPreConditionId() {
    if (this.node && this.PreConditionId == -1) {
      const comps = this.node.getComponents(PreCondition);
      this.PreConditionId = comps.findIndex(ed => ed == this);
    }
  }

  testCondition(data?: any): boolean {
    return false;
  }
}
