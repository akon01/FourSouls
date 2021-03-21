import { _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('CardOwnerTakeDamageOnRoll')
export class CardOwnerTakeDamageOnRoll extends Condition {
  @property
  rollOf: number = 0
  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_TAKEN


  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    let player: Player = meta.methodScope.getComponent(Player)!;
    let thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    let cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;

    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      // meta.passiveEvent == PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_TAKEN &&
      meta.args[1] == this.rollOf
    ) {
      return true;
    } else {
      return false;
    }
  }
}
