import { _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('PlayerHasCoins')
export class PlayerHasCoins extends Condition {
  event = PASSIVE_EVENTS.PLAYER_CHANGE_MONEY
  @property
  numOfMoneyNeeded = 1
  @property
  isOneTimeOnly = false

  @property
  orMoreThanNeeded = true

  @property
  isNotEqualToNumber = false

  isFirstTime = true
  needsDataCollector = false;
  async testCondition(meta: PassiveMeta) {
    if (this.isOneTimeOnly && !this.isFirstTime) return false;
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    let answer = true
    if (!(player instanceof Player)) {
      answer = false
    }
    if (this.isNotEqualToNumber) {
      if (player.coins == this.numOfMoneyNeeded) {
        answer = false
      }
    } else {
      if (this.orMoreThanNeeded) {
        if (!(player.coins >= this.numOfMoneyNeeded)) {
          answer = false
        }
      } else {
        if (!(player.coins == this.numOfMoneyNeeded)) {
          answer = false
        }
      }
    }
    return answer
  }
}
