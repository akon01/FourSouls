import { _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../../Constants";
import { PassiveMeta } from "../../../Managers/PassiveMeta";
import { Condition } from "../Condition";
const { ccclass, property } = _decorator;


@ccclass('HeadlessHorsemanCondition')
export class HeadlessHorsemanCondition extends Condition {
  event = PASSIVE_EVENTS.MONSTER_GET_HIT
  _isFirstTime = true
  @property(Condition)
  monsterDeathCondition: Condition | null = null
  // @property(CCInteger)
  // monsterDeathConditionIdFinal: number = -1
  async testCondition(meta: PassiveMeta) {
    if (!this.monsterDeathCondition) {
      throw new Error("No Monster Death Condition Set!")
    }
    if (!this._isFirstTime) {
      return false;
    }
    return await this.monsterDeathCondition.testCondition(meta);
  }
}
