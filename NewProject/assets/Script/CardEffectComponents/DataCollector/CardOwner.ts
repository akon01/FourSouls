import { COLLECTORTYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";
import { EffectTarget } from "../../Managers/DataInterpreter";
import CardManager from "../../Managers/CardManager";
import Card from "../../Entites/GameEntities/Card";


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
    const card = Card.getCardNodeByChild(this.node)
    const playerComp = PlayerManager.getPlayerByCard(card)
    let player
    if (playerComp) {
      player = playerComp.character
    } else {
      player = PlayerManager.getPlayerByCard(CardManager.getCardOwner(card)).character
    }
    const target = new EffectTarget(player)
    //let data2 = { cardOwner: player.playerId };
    return target;
  }
}
