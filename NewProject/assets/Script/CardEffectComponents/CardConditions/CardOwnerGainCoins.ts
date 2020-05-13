import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerGainCoin extends Condition {

  event = PASSIVE_EVENTS.PLAYER_CHANGE_MONEY

  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node)
    const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      player.playerId == PlayerManager.mePlayer.getComponent(Player).playerId &&
      // meta.passiveEvent == PASSIVE_EVENTS.PLAYER_CHANGE_MONEY &&
      meta.args[0] > 0
    ) {
      return true;
    } else {
      return false;
    }
  }
}
