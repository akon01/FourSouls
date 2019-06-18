import ConditionInterface from "./ConditionInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Condition extends cc.Component
  implements ConditionInterface {
  testCondition(data?: any): boolean {
    return null;
  }
}
