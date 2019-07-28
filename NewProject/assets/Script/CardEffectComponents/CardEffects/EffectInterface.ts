import { CHOOSE_TYPE } from "./../../Constants";
import DataCollector from "../DataCollector/DataCollector";
import Condition from "../CardConditions/Condition";
import PreCondition from "../PreConditions/PreCondition";
import Cost from "../Costs/Cost";
import { ActiveEffectData } from "../../Managers/NewScript";

const { ccclass, property } = cc._decorator;

export default interface EffectInterface {
  effectName: string;

  chooseType: CHOOSE_TYPE;

  dataCollector: DataCollector[];

  cost: Cost;

  condition: Condition;

  preCondition: PreCondition;

  hasSubAction: boolean;

  effectData: ActiveEffectData;

  reverseEffect();

  doEffect(data?): Promise<Object>;
}
