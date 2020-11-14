import DataCollector from "../DataCollector/DataCollector";
import PreCondition from "./PreCondition";


export default interface PreConditionInterface {
  preConditionId: number
  testCondition(data?);
  dataCollector: DataCollector;
  conditionData: any;
  setWithOld(old: PreCondition)
}
