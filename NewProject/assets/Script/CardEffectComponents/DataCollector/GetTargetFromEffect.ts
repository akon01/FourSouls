import { COLLECTORTYPE } from "../../Constants";
import CardEffect from "../../Entites/CardEffect";

import Effect from "../CardEffects/Effect";
import IdAndName from "../IdAndNameComponent";
import DataCollector from "./DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GetTargetFromEffect extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromEffect";

  // setWithOld(data: GetTargetFromEffect) {
  //   debugger
  //   if (data.effectToGetTargetsFrom.hasBeenHandled) {
  //     this.effectToGetTargetsFromId.id = data.effectToGetTargetsFrom.EffectId
  //     this.effectToGetTargetsFromId.name = data.effectToGetTargetsFrom.effectName
  //   } else {
  //     const newEffectId = createNewEffect(data.effectToGetTargetsFrom, this.node, true)
  //     this.effectToGetTargetsFromId.id = newEffectId;
  //     this.effectToGetTargetsFromId.name = data.effectToGetTargetsFrom.effectName
  //   }
  //   data.effectToGetTargetsFrom = null
  //   this.effectToGetTargetsFrom = null
  // }


  @property(cc.Integer)
  effectToGetTargetsFromIdFinal: number = -1



  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data) {

    const effectData = this.node.getComponent(CardEffect).getEffect(this.effectToGetTargetsFromIdFinal).effectData
    return effectData.effectTargets;
  }
}
