import { COLLECTORTYPE } from "../../Constants";
import CardEffect from "../../Entites/CardEffect";
import Card from "../../Entites/GameEntities/Card";
import Effect from "../CardEffects/Effect";
import DataCollector from "./DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GetTargetFromConcurentData extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromConcurentData";

  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data) {

    const effectData = Card.getCardNodeByChild(this.node).getComponent(CardEffect).concurentEffectData


    // let target = new EffectTarget(player)
    //let data2 = { cardOwner: player.playerId };
    return effectData.effectTargets;
  }
}
