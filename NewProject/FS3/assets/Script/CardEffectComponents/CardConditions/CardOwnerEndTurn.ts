import { error, _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from './Condition';
@ccclass("CardOwnerEndTurn")
export class CardOwnerEndTurn extends Condition {
  event = PASSIVE_EVENTS.PLAYER_END_TURN
  @property
  isCardOwnerOnly: boolean = true;
  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    error(`test card owner end turn`)
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    let answer = false;
    if (
      player instanceof Player &&
      player.playerId == WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId

    ) { answer = true }
    if (this.isCardOwnerOnly) {
      if (player.name == cardOwner.name) {
        answer = true
      } else {
        answer = false;
      }

    }
    return answer
  }
}
