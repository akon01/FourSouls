import { _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass } = _decorator;


@ccclass('CardOwnerPayPenalties')
export class CardOwnerPayPenalties extends Condition {

  event = PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES
  testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    if (
      player instanceof Player &&
      player.name == cardOwner.name
      // &&  meta.passiveEvent == PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES
    ) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
}