import DataCollector from "../DataCollector/DataCollector";
import PreCondition from "./PreCondition";


export default interface PreConditionInterface {
  PreConditionId: number
  testCondition(data?);
  dataCollector: DataCollector;
  conditionData: any;
  setWithOld(old: PreCondition)
}
