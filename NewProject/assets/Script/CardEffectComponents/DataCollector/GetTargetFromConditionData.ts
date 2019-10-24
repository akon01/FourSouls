import { COLLECTORTYPE } from "../../Constants";
import Effect from "../CardEffects/Effect";
import DataCollector from "./DataCollector";
import Condition from "../CardConditions/Condition";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GetTargetFromConditionData extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromConditionData";

  @property(Condition)
  conditionToGetTargetsFrom: Condition = null;

  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data) {

    let effectData = this.conditionToGetTargetsFrom.conditionData;





    // let player = PlayerManager.getPlayerByCard(this.node.parent.parent).character
    // let target = new EffectTarget(player)
    //let data2 = { cardOwner: player.playerId };
    return effectData.effectTargets;
  }
}
