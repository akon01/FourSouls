import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_CARD_TYPE, PASSIVE_EVENTS } from "../../Constants";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";

export default interface ConditionInterface {
  testCondition(data?): Promise<Object>;
  dataCollector: DataCollector;
  event: PASSIVE_EVENTS
  events: PASSIVE_EVENTS[];
  conditionData: ActiveEffectData | PassiveEffectData;
  isAddPassiveEffect: boolean
  needsDataCollector: boolean

}
