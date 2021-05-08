import { _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('StartTurn')
export class StartTurn extends Condition {
  event = PASSIVE_EVENTS.PLAYER_START_TURN
  @property
  isOwnerOnly = true;
  testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    let answer = false;
    if (
      player instanceof Player &&
      player.playerId == WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId
      // &&
      // meta.passiveEvent == PASSIVE_EVENTS.PLAYER_START_TURN
    ) {
      if (this.isOwnerOnly) {
        if (player.name == cardOwner.name) answer = true
      } else {
        answer = true;
      }
    }
    return Promise.resolve(answer);
  }
}