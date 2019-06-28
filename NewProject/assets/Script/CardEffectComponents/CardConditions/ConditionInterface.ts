import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default interface ConditionInterface {
  testCondition(data?);
  dataCollector: DataCollector;
  chooseType: CHOOSE_TYPE;
  conditionData: any;
}
