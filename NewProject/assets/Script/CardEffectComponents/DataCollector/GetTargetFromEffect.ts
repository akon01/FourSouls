import { COLLECTORTYPE } from "../../Constants";
import Effect from "../CardEffects/Effect";
import DataCollector from "./DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GetTargetFromEffect extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromEffect";

  @property(Effect)
  effectToGetTargetsFrom: Effect = null;

  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data) {

    const effectData = this.effectToGetTargetsFrom.effectData

    // let player = PlayerManager.getPlayerByCard(this.node.parent.parent).character
    // let target = new EffectTarget(player)
    //let data2 = { cardOwner: player.playerId };
    return effectData.effectTargets;
  }
}
