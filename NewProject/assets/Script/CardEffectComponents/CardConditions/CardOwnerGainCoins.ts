import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerGainCoin extends Condition {


  event = PASSIVE_EVENTS.PLAYER_CHANGE_MONEY

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
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
