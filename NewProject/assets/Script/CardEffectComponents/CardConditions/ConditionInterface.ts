const { ccclass, property } = cc._decorator;

@ccclass
export default interface ConditionInterface {
  testCondition(data?);
}
