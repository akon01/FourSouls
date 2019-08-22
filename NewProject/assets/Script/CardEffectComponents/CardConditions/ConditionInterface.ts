import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_CARD_TYPE } from "../../Constants";

export default interface ConditionInterface {
  testCondition(data?): Promise<Object>;
  dataCollector: DataCollector;
  chooseType: CHOOSE_CARD_TYPE;
  conditionData: any;
}
