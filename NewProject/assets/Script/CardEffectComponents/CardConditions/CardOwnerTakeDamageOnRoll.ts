import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerTakeDamageOnRoll extends Condition {

  @property
  rollOf: number = 0

  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_TAKEN

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = Card.getCardNodeByChild(this.node)
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);

    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      //     meta.passiveEvent == PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_TAKEN &&
      meta.args[1] == this.rollOf
    ) {
      return true;
    } else {
      return false;
    }
  }
}
