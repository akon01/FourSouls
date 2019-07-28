import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE } from "../../Constants";

export default interface ConditionInterface {
  testCondition(data?): Promise<Object>;
  dataCollector: DataCollector;
  chooseType: CHOOSE_TYPE;
  conditionData: any;
}
