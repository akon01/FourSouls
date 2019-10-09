import { PASSIVE_EVENTS } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import { PassiveMeta } from "../../Managers/PassiveManager";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterCombatDamageTaken extends Condition {

  @property
  isSpecificToEntityTakesDamage: boolean = false;

  @property({
    type: cc.Node, visible: function (this: MonsterCombatDamageTaken) {
      if (this.isSpecificToEntityTakesDamage) return true
    }
  })
  entityWhoTookDamage: cc.Node = null;


  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN

  async testCondition(meta: PassiveMeta) {
    let monster: Monster = meta.methodScope.getComponent(Monster);
    let thisCard = this.node.parent.parent;
    let answer = false;
    if (monster instanceof Monster) answer = true;
    if (this.isSpecificToEntityTakesDamage) {
      if (this.entityWhoTookDamage != meta.args[3]) answer = false;
    }
    return answer


  }
}
