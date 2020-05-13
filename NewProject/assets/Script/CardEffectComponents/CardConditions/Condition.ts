import ConditionInterface from "./ConditionInterface";
import { PassiveEffectData, ActiveEffectData } from "../../Managers/DataInterpreter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Condition extends cc.Component
  implements ConditionInterface {
  isAddPassiveEffect: boolean = false;;
  events: Array<import("../../Constants").PASSIVE_EVENTS> = [];
  event: import("../../Constants").PASSIVE_EVENTS;
  conditionData: ActiveEffectData | PassiveEffectData;
  dataCollector: import("../DataCollector/DataCollector").default;
  needsDataCollector: boolean = true
  async testCondition(data?: any): Promise<boolean> {
    return false;
  }
}
