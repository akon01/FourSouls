import { COLLECTORTYPE } from "../../Constants";
import Effect from "../CardEffects/Effect";
import DataCollector from "./DataCollector";
import Condition from "../CardConditions/Condition";
import IdAndName from "../IdAndNameComponent";
import { createNewCondition } from "../../reset";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GetTargetFromConditionData extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromConditionData";

  setWithOld(data: GetTargetFromConditionData) {
    const oldCondition = data.conditionToGetTargetsFrom;
    if (oldCondition.newCompCondition) {
      this.conditionToGetTargetsFromId.id = oldCondition.newCompCondition.ConditionId
      this.conditionToGetTargetsFromId.name = oldCondition.newCompCondition.name
    } else {
      const newCondition = createNewCondition(this.node, oldCondition)
      this.conditionToGetTargetsFromId.id = newCondition.ConditionId
      this.conditionToGetTargetsFromId.name = newCondition.name
    }
    data.conditionToGetTargetsFrom = null
    this.conditionToGetTargetsFrom = null
  }

  @property(Condition)
  conditionToGetTargetsFrom: Condition = null;

  @property(IdAndName)
  conditionToGetTargetsFromId: IdAndName = new IdAndName()

  @property(cc.Integer)
  conditionToGetTargetsFromIdFinal: number = -1

  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data) {

    let effectData = this.conditionToGetTargetsFrom.conditionData;






    // let target = new EffectTarget(player)
    //let data2 = { cardOwner: player.playerId };
    return effectData.effectTargets;
  }
}
