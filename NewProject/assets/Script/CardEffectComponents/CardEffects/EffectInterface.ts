import { CHOOSE_CARD_TYPE } from "./../../Constants";
import DataCollector from "../DataCollector/DataCollector";
import Condition from "../CardConditions/Condition";
import PreCondition from "../PreConditions/PreCondition";
import Cost from "../Costs/Cost";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";

const { ccclass, property } = cc._decorator;

export default interface EffectInterface {
  effectName: string;

  chooseType: CHOOSE_CARD_TYPE;

  dataCollector: DataCollector[];

  cost: Cost;

  conditions: Condition[];

  preCondition: PreCondition;

  hasSubAction: boolean;

  isSilent: boolean;

  effectData: ActiveEffectData | PassiveEffectData;

  hasLockingResolve: boolean

  lockingResolve: number

  reverseEffect();

  doEffect(data?): Promise<Object>;
}
