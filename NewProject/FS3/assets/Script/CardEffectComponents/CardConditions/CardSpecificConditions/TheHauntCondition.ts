import { _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../../Constants";
import { PassiveMeta } from "../../../Managers/PassiveMeta";
import { Condition } from "../Condition";
const { ccclass, property } = _decorator;


@ccclass('TheHauntCondition')
export class TheHauntCondition extends Condition {
  event = PASSIVE_EVENTS.MONSTER_GET_HIT
  dmgRecived = 0
  lastBonus = 0
  testCondition(meta: PassiveMeta) {
    if (!meta.args) { debugger; throw new Error("No Args!"); }

    this.dmgRecived += meta.args[0]

    if (this.dmgRecived - this.lastBonus >= 2) {
      this.lastBonus = this.dmgRecived
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
}
