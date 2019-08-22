import DataCollector from "../DataCollector/DataCollector";


export default interface PreConditionInterface {
  testCondition(data?);
  dataCollector: DataCollector;
  conditionData: any;
}
