import PreConditionInterface from "./PreConditionInterface";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PreCondition extends cc.Component
  implements PreConditionInterface {
  dataCollector: import("../DataCollector/DataCollector").default;
  conditionData: any;
  testCondition(data?: any): boolean {
    return null;
  }
}
