import ConditionInterface from "./ConditionInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Condition extends cc.Component
  implements ConditionInterface {
  conditionData: any;
  chooseType: import("../../Constants").CHOOSE_TYPE;
  dataCollector: import("../DataCollector/DataCollector").default;
  async testCondition(data?: any): Promise<boolean> {
    return true;
  }
}
