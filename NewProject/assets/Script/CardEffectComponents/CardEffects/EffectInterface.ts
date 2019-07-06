import { CHOOSE_TYPE } from "./../../Constants";
import DataCollector from "../DataCollector/DataCollector";
import Condition from "../CardConditions/Condition";
import PreCondition from "../PreConditions/PreCondition";
import Cost from "../Costs/Cost";

const { ccclass, property } = cc._decorator;

export default interface EffectInterface {
  effectName: string;

  chooseType: CHOOSE_TYPE;

  dataCollector: DataCollector;

  cost: Cost;

  condition: Condition;

  preCondition: PreCondition;

  hasSubAction: boolean;

  reverseEffect();

  doEffect(data?): Promise<{}>;
}
