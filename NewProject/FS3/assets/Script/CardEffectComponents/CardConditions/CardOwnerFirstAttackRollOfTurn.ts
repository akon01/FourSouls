import { _decorator } from 'cc';
const { ccclass } = _decorator;

import { PASSIVE_EVENTS, ROLL_TYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('CardOwnerFirstAttackRollOfTurn')
export class CardOwnerFirstAttackRollOfTurn extends Condition {
  event = PASSIVE_EVENTS.PLAYER_ROLL_DICE
  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      meta.args[1] == ROLL_TYPE.FIRST_ATTACK &&
      player._isFirstAttackRollOfTurn
    ) {
      return true;
    } else {
      return false;
    }
  }
}
