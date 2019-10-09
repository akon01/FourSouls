import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import CardManager from "../../Managers/CardManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerDamageGiven extends Condition {


  //  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN

  events = [PASSIVE_EVENTS.PLAYER_GET_HIT, PASSIVE_EVENTS.MONSTER_GET_HIT]

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    let damageDealer = PlayerManager.getPlayerByCard(meta.args[1])
    if (!damageDealer) {
      return false;
    }
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      cardOwner.playerId && damageDealer.playerId
    ) {
      return true;
    } else {
      return false;
    }
  }
}
