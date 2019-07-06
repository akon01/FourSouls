import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default interface PreConditionInterface {
  testCondition(data?);
  dataCollector: DataCollector;
  conditionData: any;
}
