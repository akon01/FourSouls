import { _decorator, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('MonsterCombatDamageTaken')
export class MonsterCombatDamageTaken extends Condition {
  @property
  isSpecificToEntityTakesDamage = false;
  // @ts-ignore
  @property({
    type: Node, visible: function (this: MonsterCombatDamageTaken) {
      if (this.isSpecificToEntityTakesDamage) { return true }
    }
  })
  entityWhoTookDamage: Node | null = null;
  @property
  isOnSpecificRoll: boolean = false
  // @ts-ignore
  @property({
    visible: function (this: MonsterCombatDamageTaken) {
      if (this.isOnSpecificRoll) { return true }
    }
  })
  rollNumber = 1
  @property
  isOwnerOnly = false;
  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN


  async testCondition(meta: PassiveMeta) {
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const monster: Monster = meta.args[3].getComponent(Monster)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    const owner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    let answer = false;
    console.log(monster)
    if (monster instanceof Monster) { answer = true; }
    if (this.isSpecificToEntityTakesDamage) {
      console.log(`who took dmg ${meta.args[3].name}`)
      console.log(`this enttiy ${this.entityWhoTookDamage!.name}`)
      if (this.entityWhoTookDamage != meta.args[3]) { answer = false; }
    }
    if (this.isOnSpecificRoll) {
      if (this.rollNumber != meta.args[1]) {
        answer = false
      }
    }
    if (this.isOwnerOnly) {
      if (owner.node != meta.methodScope) {
        answer = false
      }
    }
    return answer

  }
}
