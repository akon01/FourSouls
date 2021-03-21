import { CCInteger, Node, _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('PlayerMissAttack')
export class PlayerMissAttack extends Condition {
  event = PASSIVE_EVENTS.PLAYER_MISS_ATTACK
  @property
  isOnSpecificRoll: boolean = false
  @property({
    type: [CCInteger], visible: function (this: PlayerMissAttack) {
      return this.isOnSpecificRoll
    }
  })
  specificRolls: number[] = []
  @property
  isOnSpecificMonster: boolean = false;
  @property({
    type: Node, visible: function (this: PlayerMissAttack) {
      return this.isOnSpecificMonster
    }
  })
  specificMonster: Node | null = null

  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    let answer = true
    if (!(player instanceof Player)) {
      answer = false;
    }
    if (this.isOnSpecificMonster) {
      if (!meta.args) { debugger; throw new Error("No Args"); }
      if (this.specificMonster != meta.args[1].node) {
        answer = false;
      }
    }
    if (this.isOnSpecificRoll) {
      let isTrue = false;
      for (const roll of this.specificRolls) {
        if (!meta.args) { debugger; throw new Error("No Args"); }
        if (meta.args[0] == roll) {
          isTrue = true
          break;
        }
      }
      if (!isTrue) {
        answer = false;
      }
    }
    return answer
  }
}
