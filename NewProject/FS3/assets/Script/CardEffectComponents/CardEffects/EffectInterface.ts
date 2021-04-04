import { Node, _decorator } from 'cc';
import { EffectPosition } from "../../EffectPosition";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { Condition } from '../CardConditions/Condition';
import { ConditionInterface } from '../CardConditions/ConditionInterface';
import { Cost } from '../Costs/Cost';
import { DataCollector } from '../DataCollector/DataCollector';
import { PreCondition } from '../PreConditions/PreCondition';
import { CHOOSE_CARD_TYPE } from "./../../Constants";
const { ccclass, property } = _decorator;

interface EffectInterface {
  node: Node
  effectName: string;
  chooseType: CHOOSE_CARD_TYPE | null;
  dataCollectors: DataCollector[]
  // dataCollectorsIdsFinal: number[];
  noDataCollector: boolean
  cost: Cost | null
  // costIdFinal: number;
  conditions: ConditionInterface[]
  // conditionsIdsFinal: number[];
  // _effectCard: Node | null;
  preCondition: PreCondition | null
  // preConditionIdFinal: number;
  hasSubAction: boolean;
  isSilent: boolean;
  effectData: ActiveEffectData | PassiveEffectData | null;
  hasLockingResolve: boolean
  lockingResolve: number
  effectPosition: EffectPosition
  isContinuousEffect: boolean
  doEffect(data?: any): Promise<Object>;
}

export type { EffectInterface }