import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerCombatDamageGiven extends Condition {

  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN

  needsDataCollector = false;

  @property
  isOnlyFirst: boolean = false

  async testCondition(meta: PassiveMeta) {
    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node)
    const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      player instanceof Player &&
      player.name == cardOwner.name
      //   &&     meta.passiveEvent == PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN
    ) {
      if (this.isOnlyFirst) {
        if (cardOwner.isFirstHitInTurn) {
          return true
        }
        return false
      }
      return true;
    } else {
      return false;
    }
  }
}
