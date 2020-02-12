import { PASSIVE_EVENTS } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import Card from "../../Entites/GameEntities/Card";
import { PassiveMeta } from "../../Managers/PassiveManager";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterCombatDamageTaken extends Condition {

  @property
  isSpecificToEntityTakesDamage: boolean = false;

  @property({
    type: cc.Node, visible: function (this: MonsterCombatDamageTaken) {
      if (this.isSpecificToEntityTakesDamage) { return true }
    }
  })
  entityWhoTookDamage: cc.Node = null;

  @property
  isOnSpecificRoll: boolean = false

  @property({
    visible: function (this: MonsterCombatDamageTaken) {
      if (this.isOnSpecificRoll) { return true }
    }
  })
  rollNumber: number = 1

  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN

  async testCondition(meta: PassiveMeta) {
    const monster: Monster = meta.args[3].getComponent(Monster);
    const thisCard = Card.getCardNodeByChild(this.node);
    let answer = false;
    cc.log(monster)
    if (monster instanceof Monster) { answer = true; }
    if (this.isSpecificToEntityTakesDamage) {
      cc.log(`who took dmg ${meta.args[3].name}`)
      cc.log(`this enttiy ${this.entityWhoTookDamage.name}`)
      if (this.entityWhoTookDamage != meta.args[3]) { answer = false; }
    }
    if (this.isOnSpecificRoll) {
      if (this.rollNumber != meta.args[1]) {
        answer = false
      }
    }
    return answer

  }
}
