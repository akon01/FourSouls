import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TakeDamage extends Condition {

  event = PASSIVE_EVENTS.PLAYER_GET_HIT

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      player instanceof Player &&
      player.name == cardOwner.name
      // &&      meta.passiveEvent == PASSIVE_EVENTS.PLAYER_GET_HIT
    ) {
      return true;
    } else {
      return false;
    }
  }
}
