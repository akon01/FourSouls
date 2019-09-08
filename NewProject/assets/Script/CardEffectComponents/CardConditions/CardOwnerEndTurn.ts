import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import { PassiveMeta } from "../../Managers/PassiveManager";
import { PASSIVE_EVENTS } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerEndTurn extends Condition {
  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      player.playerId == PlayerManager.mePlayer.getComponent(Player).playerId &&
      meta.passiveEvent == PASSIVE_EVENTS.PLAYER_END_TURN
    ) {
      return true;
    } else {
      return false;
    }
  }
}
