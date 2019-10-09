import { COLLECTORTYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";
import { EffectTarget } from "../../Managers/DataInterpreter";
import CardManager from "../../Managers/CardManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwner extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "CardOwner";

  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data) {


    let player = PlayerManager.getPlayerByCard(this.node.parent.parent).character
    if (!player) {
      player = PlayerManager.getPlayerByCard(CardManager.getCardOwner(this.node.parent.parent)).character
    }
    let target = new EffectTarget(player)
    //let data2 = { cardOwner: player.playerId };
    return target;
  }
}
