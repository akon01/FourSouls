import { _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('PlayerHasLootsInHand')
export class PlayerHasLootsInHand extends Condition {
  events = [PASSIVE_EVENTS.PLAYER_LOSE_LOOT, PASSIVE_EVENTS.PLAYER_GAIN_LOOT]
  @property
  numOfLootsNeeded: number = 1

  @property
  isNotEqualToNumber: boolean = false

  needsDataCollector = false;
  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    let answer = true
    if (!(player instanceof Player)) {
      answer = false
    }
    if (this.isNotEqualToNumber) {
      if (player.getHandCards().length == this.numOfLootsNeeded) {
        answer = false
      }
    } else {
      if (player.getHandCards().length != this.numOfLootsNeeded) {
        answer = false
      }
    }
    if (!(this.events.indexOf(meta.passiveEvent!) >= 0)) {
      answer = false
    }
    return answer
  }
}
