import { error, _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { CardManager } from "../../Managers/CardManager";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { PlayerManager } from "../../Managers/PlayerManager";
import { Condition } from "./Condition";
import { Card } from "../../Entites/GameEntities/Card";
import { Character } from "../../Entites/CardTypes/Character";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('CardOwnerDamageGiven')
export class CardOwnerDamageGiven extends Condition {
  //  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN
  events = [PASSIVE_EVENTS.PLAYER_GET_HIT, PASSIVE_EVENTS.MONSTER_GET_HIT]
  //@ts-ignore
  @property({
    visible: function (this: CardOwnerDamageGiven) {
      if (this.isOnlyPlayers == false) { return true }
    }
  })
  isOnlyMonsters: boolean = false;
  //@ts-ignore
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
    error(`events to check ,`, eventsToCheck)
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const damageDealer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(meta.args[1])
    if (!damageDealer) {
      return false;
    }
    if (
      damageDealer instanceof Player &&
      cardOwner.playerId && damageDealer.playerId &&
      eventsToCheck.indexOf(meta.passiveEvent!) >= 0
    ) {
      return true;
    } else {
      return false;
    }
  }
}
