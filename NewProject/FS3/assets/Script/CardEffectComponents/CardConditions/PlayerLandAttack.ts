import { CCInteger, Node, _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Card } from "../../Entites/GameEntities/Card";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('PlayerLandAttack')
export class PlayerLandAttack extends Condition {
  event = PASSIVE_EVENTS.PLAYER_LAND_ATTACK
  @property
  isOnSpecificRoll = false
  @property({
    type: [CCInteger], visible: function (this: PlayerLandAttack) {
      return this.isOnSpecificRoll
    }
  })
  specificRolls: number[] = []
  @property
  isOnSpecificMonster = false;
  @property({
    type: Node, visible: function (this: PlayerLandAttack) {
      return this.isOnSpecificMonster
    }
  })
  specificMonster: Node | null = null

  testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
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
    return Promise.resolve(answer);
  }
}
