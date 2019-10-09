import ConditionInterface from "./ConditionInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Condition extends cc.Component
  implements ConditionInterface {
  events: import("../../Constants").PASSIVE_EVENTS[] = [];
  event: import("../../Constants").PASSIVE_EVENTS;
  conditionData: any;
  dataCollector: import("../DataCollector/DataCollector").default;
  async testCondition(data?: any): Promise<boolean> {
    return true;
  }
}
