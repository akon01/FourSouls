import { log, _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { BattleManager } from "../../Managers/BattleManager";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { TurnsManager } from "../../Managers/TurnsManager";
import { DataCollector } from "../DataCollector/DataCollector";
import { Condition } from "./Condition";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('PlayerRollSameNumberInARow')
export class PlayerRollSameNumberInARow extends Condition {
  event = PASSIVE_EVENTS.PLAYER_ROLL_DICE
  @property
  isOnlyAttackingPlayer: boolean = false;


  async testCondition(meta: PassiveMeta) {

    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const numberRolledNow = meta.args[0]
    let answer = false;
    log(`player ${player.name} rolled ${numberRolledNow}, last numberRoll is ${player.lastRoll}`)
    //  let playerName = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(this.conditionData.cardChosenId).name;
    if (
      player instanceof Player
    ) {
      if (this.isOnlyAttackingPlayer) {
        if ((WrapperProvider.battleManagerWrapper.out.currentlyAttackedMonsterNode != null && player == WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer() && player.lastAttackRoll == numberRolledNow)) {
          answer = true;
        }
      } else if (player.lastRoll == numberRolledNow) {
        answer = true
      }
    }
    log(`answer is ${answer}`)
    return answer
  }
}
