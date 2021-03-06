import { _decorator } from 'cc';
const { ccclass } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('CardOwnerTakeDamage')
export class CardOwnerTakeDamage extends Condition {
  event = PASSIVE_EVENTS.PLAYER_GET_HIT

  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
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
