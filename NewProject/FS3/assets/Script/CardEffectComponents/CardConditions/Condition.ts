import { CCInteger, Component, _decorator } from 'cc';
import { PASSIVE_EVENTS } from '../../Constants';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { DataCollector } from '../DataCollector/DataCollector';
import { ConditionInterface } from './ConditionInterface';

const { ccclass, property } = _decorator;






@ccclass('Condition')
export class Condition extends Component implements ConditionInterface {
  newCompCondition: Condition | null = null

  @property({ type: CCInteger, step: 1 })
  ConditionId: number = -1;
  isAddPassiveEffect: boolean = false;;
  events: Array<PASSIVE_EVENTS> = [];
  event: PASSIVE_EVENTS | null = null;
  conditionData: ActiveEffectData | PassiveEffectData = new ActiveEffectData;
  @property(Component)
  dataCollector: DataCollector | null = null
  // @property(CCInteger)
  // dataCollectorIdFinal: number = -1














  getDataCollector() {
    // if (this.dataCollectorIdFinal != -1) {
    //   return this.node.getComponent(CardEffect)!.getDataCollector(this.dataCollectorIdFinal)
    // }
    return this.dataCollector

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
