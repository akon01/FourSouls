import { _decorator, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

import { COLLECTORTYPE } from "../../Constants";
import { CardEffect } from "../../Entites/CardEffect";
import { Effect } from "../CardEffects/Effect";
import { IdAndNameComponent as IdAndName } from "../IdAndNameComponent";
import { DataCollector } from "./DataCollector";

@ccclass('GetTargetFromEffect')
export class GetTargetFromEffect extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromEffect";


  // @property(CCInteger)
  // effectToGetTargetsFromIdFinal: number = -1

  @property(Effect)
  effectToGetTargetsFrom: Effect | null = null
  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data: any) {

    if (!this.effectToGetTargetsFrom) { debugger; throw new Error("No Effect To Get Targets From!"); }

    const effectData =
      // this.node.getComponent(CardEffect)!.getEffect(this.effectToGetTargetsFromIdFinal)
      this.effectToGetTargetsFrom
        .effectData!
    return effectData.effectTargets;
  }
}