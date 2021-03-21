import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('CardOwnerPreventDamage')
export class CardOwnerPreventDamage extends Condition {
  event = PASSIVE_EVENTS.PLAYER_PREVENT_DAMAGE
  @property
  isOwnerOnly: boolean = false;
  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    let answer = false
    if (
      player instanceof Player &&
      player.name == cardOwner.name
    ) {
      answer = true;
      if (this.isOwnerOnly) {
        if (player.playerId == cardOwner.playerId) {
          answer = true
        } else {
          answer = false
        }
      }
    }
    return answer
  }
}
