import { _decorator, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

import { COLLECTORTYPE } from "../../Constants";
import { Effect } from "../CardEffects/Effect";
import { DataCollector } from "./DataCollector";
import { Condition } from "../CardConditions/Condition";
import { IdAndNameComponent as IdAndName } from "../IdAndNameComponent";
import { CardEffect } from "../../Entites/CardEffect";

@ccclass('GetTargetFromConditionData')
export class GetTargetFromConditionData extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromConditionData";

  // @property(CCInteger)
  // conditionToGetTargetsFromIdFinal: number = -1

  @property(Condition)
  conditionToGetTargetsFrom: Condition | null = null
  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data: any) {

    if (!this.conditionToGetTargetsFrom) { debugger; throw new Error("No Condition To Get Target From"); }

    let effectData =
      // this.node.getComponent(CardEffect)!.getCondition(this.conditionToGetTargetsFromIdFinal)
      this.conditionToGetTargetsFrom
        .conditionData;


    return effectData.effectTargets;
  }
}