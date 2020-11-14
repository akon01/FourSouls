
import { PASSIVE_EVENTS } from "../../../Constants";
import Monster from "../../../Entites/CardTypes/Monster";
import Card from "../../../Entites/GameEntities/Card";
import { PassiveMeta } from "../../../Managers/PassiveManager";
import AtSpecificHP from "../AtSpecificHP";
import Condition from "../Condition";
import MonsterIsKilled from "../MonsterIsKilled";


const { ccclass, property } = cc._decorator;

@ccclass("TheHauntCondition")
export default class TheHauntCondition extends Condition {

  event = PASSIVE_EVENTS.MONSTER_GET_HIT

  dmgRecived = 0

  lastBonus = 0


  async testCondition(meta: PassiveMeta) {
    this.dmgRecived += meta.args[0]

    if (this.dmgRecived - this.lastBonus >= 2) {
      this.lastBonus = this.dmgRecived
      return true
    } else {
      return false
    }
  }
}
