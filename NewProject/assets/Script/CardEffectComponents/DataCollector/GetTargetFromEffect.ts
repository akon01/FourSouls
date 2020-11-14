import { COLLECTORTYPE } from "../../Constants";
import CardEffect from "../../Entites/CardEffect";
import { createNewEffect, handleEffect } from "../../reset";
import Effect from "../CardEffects/Effect";
import IdAndName from "../IdAndNameComponent";
import DataCollector from "./DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GetTargetFromEffect extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromEffect";

  @property(Effect)
  effectToGetTargetsFrom: Effect = null;

  setWithOld(data: GetTargetFromEffect) {
    debugger
    if (data.effectToGetTargetsFrom.hasBeenHandled) {
      this.effectToGetTargetsFromId.id = data.effectToGetTargetsFrom.EffectId
      this.effectToGetTargetsFromId.name = data.effectToGetTargetsFrom.effectName
    } else {
      const newEffectId = createNewEffect(data.effectToGetTargetsFrom, this.node, true)
      this.effectToGetTargetsFromId.id = newEffectId;
      this.effectToGetTargetsFromId.name = data.effectToGetTargetsFrom.effectName
    }
    data.effectToGetTargetsFrom = null
    this.effectToGetTargetsFrom = null
  }

  @property(IdAndName)
  effectToGetTargetsFromId: IdAndName = new IdAndName();


  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data) {

    const effectData = this.node.getComponent(CardEffect).getEffect(this.effectToGetTargetsFromId.id).effectData
    return effectData.effectTargets;
  }
}
