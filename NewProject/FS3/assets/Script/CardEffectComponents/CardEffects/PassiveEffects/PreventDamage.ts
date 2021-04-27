import { _decorator } from 'cc';
import { TARGETTYPE } from '../../../Constants';
import { PassiveEffectData } from "../../../Managers/PassiveEffectData";
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { Effect } from "../Effect";
const { ccclass, property } = _decorator;


@ccclass('PreventDamagePassive')
export class PreventDamagePassive extends Effect {
  effectName = "PreventDamagePassive";
  @property({ visible: function (this: PreventDamagePassive) { return !this.isGetDamageFromDataCollector } })
  isPreventAllDamage = false;

  @property({
    visible: function (this: PreventDamagePassive) {
      return !this.isPreventAllDamage && !this.isGetDamageFromDataCollector
    }
  })
  damageToPrevent = 1;

  @property({ visible: function (this: PreventDamagePassive) { return !this.isPreventAllDamage } })
  isGetDamageFromDataCollector = false
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }

    let damageToPrevent = this.damageToPrevent
    if (this.isGetDamageFromDataCollector) {
      damageToPrevent = data.getTarget(TARGETTYPE.NUMBER)! as number
    }
    if (!this.isPreventAllDamage) {
      data.methodArgs[0] -= damageToPrevent
      if (data.methodArgs[0] < 0) {
        data.methodArgs[0] = 0
      }
    } else {
      data.methodArgs[0] = 0
    }

    return data
  }
}