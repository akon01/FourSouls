import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass('BlankCondition')
export default class BlankCondition extends Condition
  implements ConditionInterface {
  isAddPassiveEffect: boolean = false;;
  events: Array<import("../../Constants").PASSIVE_EVENTS> = [];
  event: import("../../Constants").PASSIVE_EVENTS;
  conditionData: any;
  dataCollector: import("../DataCollector/DataCollector").default;
  needsDataCollector: boolean = true
  async testCondition(data?: any): Promise<boolean> {
    return false;
  }
}
