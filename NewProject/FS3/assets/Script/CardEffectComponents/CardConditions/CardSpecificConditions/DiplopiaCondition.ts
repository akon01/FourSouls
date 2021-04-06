import { _decorator } from 'cc';
import { DiplopiaEffect } from '../../../CardSpecificEffects/DiplopiaEffect';
import { PASSIVE_EVENTS } from "../../../Constants";
import { PassiveMeta } from "../../../Managers/PassiveMeta";
import { Condition } from "../Condition";
const { ccclass, property } = _decorator;


@ccclass('DiplopiaCondition')
export class DiplopiaCondition extends Condition {
  event = PASSIVE_EVENTS.PLAYER_END_TURN
  @property(DiplopiaEffect)
  diplopiaEffect: DiplopiaEffect | null = null
  // @property(CCInteger)
  // monsterDeathConditionIdFinal: number = -1
  async testCondition(meta: PassiveMeta) {
    if (!this.diplopiaEffect) {
      throw new Error("No Diplopia Effect Set!")
    }
    if (this.diplopiaEffect.copiedCard == null) {
      return false;
    }
    return true
  }
}
