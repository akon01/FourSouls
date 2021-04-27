import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { ConditionInterface } from "./ConditionInterface";
import { Condition } from "./Condition";
import { PASSIVE_EVENTS } from '../../Constants';
import { DataCollector } from '../DataCollector/DataCollector';

@ccclass('BlankCondition')
export class BlankCondition extends Condition implements ConditionInterface {
  isAddPassiveEffect = false;
  events: Array<PASSIVE_EVENTS> = [];
  event: PASSIVE_EVENTS = PASSIVE_EVENTS.CARD_GAINS_COUNTER;
  conditionData: any;
  dataCollector: DataCollector | null = null;
  needsDataCollector = true
  async testCondition(data?: any): Promise<boolean> {
    return false;
  }
}