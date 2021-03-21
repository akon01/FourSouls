import { _decorator } from 'cc';
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Effect } from '../CardEffects/Effect';
import { PreCondition } from '../PreConditions/PreCondition';
const { ccclass, property } = _decorator;


@ccclass('EffectIsRunning')
export class EffectIsRunning extends PreCondition {

  @property(Effect)
  effectToCheck: Effect | null = null

  @property
  checkIsNotRunning = false

  needsDataCollector = false;
  testCondition(meta: PassiveMeta) {
    let answer = true
    if (!this.effectToCheck) throw new Error("No Effect To Check If Running");
    if (this.checkIsNotRunning) {
      answer = !this.effectToCheck.isEffectRunning()
    } else {
      answer = this.effectToCheck.isEffectRunning()
    }
    return answer
  }
}
