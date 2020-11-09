import DataCollector from "../DataCollector/DataCollector";


export default interface PreConditionInterface {
  preConditionId: number
  testCondition(data?);
  dataCollector: DataCollector;
  conditionData: any;
}
