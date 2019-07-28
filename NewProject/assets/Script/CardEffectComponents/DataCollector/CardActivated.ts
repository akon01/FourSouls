import { COLLECTORTYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";
import CardManager from "../../Managers/CardManager";
import { EffectTarget } from "../../Managers/DataInterpreter";


const { ccclass, property } = cc._decorator;

@ccclass
export default class CardActivated extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "CardActivated";

  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data) {
    let card = CardManager.getCardById(data.cardId, true)
    let target = new EffectTarget(card);
    let data2 = { cardActivated: data.cardId };
    return target;
  }
}
