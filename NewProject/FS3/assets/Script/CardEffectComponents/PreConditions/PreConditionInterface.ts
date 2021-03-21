import { _decorator } from 'cc';
import { DataCollector } from "../DataCollector/DataCollector";
import { PreCondition } from "./PreCondition";
interface PreConditionInterface {
  PreConditionId: number
  testCondition(data?: any): boolean;
  // dataCollectorIdFinal: number;
  dataCollector: DataCollector | null
  conditionData: any;
  setWithOld(old: PreCondition): void
}

export type { PreConditionInterface }
