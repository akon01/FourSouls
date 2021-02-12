import DataCollector from "../DataCollector/DataCollector";
import PreCondition from "./PreCondition";


export default interface PreConditionInterface {
  PreConditionId: number
  testCondition(data?);
  dataCollectorIdFinal: number;
  conditionData: any;
  setWithOld(old: PreCondition)
}
