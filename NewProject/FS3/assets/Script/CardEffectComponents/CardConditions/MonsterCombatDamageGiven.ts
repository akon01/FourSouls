import { _decorator, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { PlayerManager } from "../../Managers/PlayerManager";
import { Condition } from "./Condition";
import { Card } from "../../Entites/GameEntities/Card";

@ccclass('MonsterCombatDamageGiven')
export class MonsterCombatDamageGiven extends Condition {
  @property
  isSpecificToEntityDealsDamage = false;
  // @ts-ignore
  @property({
    type: Node, visible: function (this: MonsterCombatDamageGiven) {
      if (this.isSpecificToEntityDealsDamage) { return true }
    }
  })
  entityWhoDealtDamage: Node | null = null;
  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_TAKEN
  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    console.log(`test monster combat damage given`)
    const player: Player = meta.methodScope.getComponent(Player)!;
    let answer = false;
    if (player instanceof Player) { answer = true; }
    if (this.isSpecificToEntityDealsDamage) {
      if (!meta.args) { debugger; throw new Error("No Args"); }
      if (this.entityWhoDealtDamage != meta.args[2]) { answer = false; }
    }
    return answer

  }
}
