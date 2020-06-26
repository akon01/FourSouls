import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";
import Character from "../../Entites/CardTypes/Character";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerDamageGiven extends Condition {

  //  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN

  events = [PASSIVE_EVENTS.PLAYER_GET_HIT, PASSIVE_EVENTS.MONSTER_GET_HIT]

  @property({
    visible: function (this: CardOwnerDamageGiven) {
      if (this.isOnlyPlayers == false) { return true }
    }
  })
  isOnlyMonsters: boolean = false;


  @property({
    visible: function (this: CardOwnerDamageGiven) {
      if (this.isOnlyMonsters == false) { return true }
    }
  })
  isOnlyPlayers: boolean = false;


  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    let eventsToCheck = [];
    if (this.isOnlyMonsters) {
      eventsToCheck.push(PASSIVE_EVENTS.MONSTER_GET_HIT)
    }
    if (this.isOnlyPlayers) {
      eventsToCheck.push(PASSIVE_EVENTS.PLAYER_GET_HIT)
    }
    if (!this.isOnlyMonsters && !this._isOnLoadCalled) {
      eventsToCheck = this.events
    }
    cc.error(`events to check ,`, eventsToCheck)
    const thisCard = Card.getCardNodeByChild(this.node)
    const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    const damageDealer = PlayerManager.getPlayerByCard(meta.args[1])
    if (!damageDealer) {
      return false;
    }
    if (
      damageDealer instanceof Player &&
      cardOwner.playerId && damageDealer.playerId &&
      eventsToCheck.includes(meta.passiveEvent)
    ) {
      return true;
    } else {
      return false;
    }
  }
}
