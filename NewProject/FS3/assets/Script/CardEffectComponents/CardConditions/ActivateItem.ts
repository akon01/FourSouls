import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { PlayerManager } from "../../Managers/PlayerManager";
import { Condition } from "./Condition";
import { Card } from "../../Entites/GameEntities/Card";
import { BattleManager } from "../../Managers/BattleManager";
import { TurnsManager } from "../../Managers/TurnsManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('ActivateItem')
export class ActivateItem extends Condition {
  event = PASSIVE_EVENTS.PLAYER_ACTIVATE_ITEM
  @property
  isOwnerOnly: boolean = true;
  @property
  isAttackingPlayerOnly: boolean = false;
  needsDataCollector = false;
  playerManagerWrapper: any;
  battleManagerWrapper: any;
  turnsManagerWrapper: any;
  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope!"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    let answer = true;
    if (!(player instanceof Player)) {
      answer = false;
    }

    if (this.isOwnerOnly) {
      if (player.name != cardOwner.name) {
        answer = false
      }
    }

    if (this.isAttackingPlayerOnly) {
      if (!(WrapperProvider.battleManagerWrapper.out.inBattle && player == WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.getTurnPlayer())) {
        answer = false;
      }
    }

    return answer
  }
}