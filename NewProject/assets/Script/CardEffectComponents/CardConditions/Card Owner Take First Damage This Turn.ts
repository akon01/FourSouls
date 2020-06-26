import { PASSIVE_EVENTS, ROLL_TYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerTakeFirstDamageThisTurn extends Condition {

  event = PASSIVE_EVENTS.PLAYER_GET_HIT

  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node)
    const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      player.isFirstHitInTurn
    ) {
      return true;
    } else {
      return false;
    }
  }
}
