import { PASSIVE_EVENTS } from "../../Constants";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { DataCollector } from "../DataCollector/DataCollector";
interface ConditionInterface {
  testCondition(data?: any): Promise<Object>;
  dataCollector: DataCollector | null
  // dataCollectorIdFinal: number;
  event: PASSIVE_EVENTS | null
  events: PASSIVE_EVENTS[];
  conditionData: ActiveEffectData | PassiveEffectData;
  isAddPassiveEffect: boolean
  needsDataCollector: boolean
  ConditionId: number
}

export type { ConditionInterface };

