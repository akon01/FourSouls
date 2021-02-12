import { CHOOSE_CARD_TYPE } from "./../../Constants";
import DataCollector from "../DataCollector/DataCollector";
import Condition from "../CardConditions/Condition";
import PreCondition from "../PreConditions/PreCondition";
import Cost from "../Costs/Cost";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import EffectPosition from "../../EffectPosition";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

export default interface EffectInterface {
  effectName: string;

  chooseType: CHOOSE_CARD_TYPE;

  dataCollectorsIdsFinal: number[];

  noDataCollector: boolean

  costIdFinal: number;

  conditionsIdsFinal: number[];

  _effectCard: cc.Node;

  preConditionIdFinal: number;

  hasSubAction: boolean;

  isSilent: boolean;

  effectData: ActiveEffectData | PassiveEffectData;

  hasLockingResolve: boolean

  lockingResolve: number

  effectPosition: EffectPosition
  setWithOld(oldEffect: Effect)

  reverseEffect();

  doEffect(data?): Promise<Object>;
}
