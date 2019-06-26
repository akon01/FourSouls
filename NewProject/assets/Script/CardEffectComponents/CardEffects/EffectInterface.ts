import { CHOOSE_TYPE } from "./../../Constants";
import DataCollector from "../DataCollector/DataCollector";
import Condition from "../CardConditions/Condition";

const { ccclass, property } = cc._decorator;

export default interface EffectInterface {
  effectName: string;

  chooseType: CHOOSE_TYPE;

  dataCollector: DataCollector;

  condition: Condition;

  hasSubAction: boolean;

  reverseEffect();

  doEffect(data?): Promise<{}>;
}
