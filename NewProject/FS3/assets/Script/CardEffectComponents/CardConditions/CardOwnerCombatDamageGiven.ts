import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('CardOwnerCombatDamageGiven')
export class CardOwnerCombatDamageGiven extends Condition {
  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN
  needsDataCollector = false;
  @property
  isOnlyFirst: boolean = false

  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    if (
      player instanceof Player &&
      player.name == cardOwner.name
      // &&     meta.passiveEvent == PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN
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