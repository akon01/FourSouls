import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { Effect } from "../Effect";
import { DataCollector } from "../../DataCollector/DataCollector";
import { PassiveEffectData } from "../../../Managers/PassiveEffectData";
import { TARGETTYPE } from '../../../Constants';

@ccclass('PreventDamagePassive')
export class PreventDamagePassive extends Effect {
  effectName = "PreventDamagePassive";
  @property({ visible: function (this: PreventDamagePassive) { return !this.isGetDamageFromDataCollector } })
  isPreventAllDamage: boolean = false;

  @property({
    visible: function (this: PreventDamagePassive) {
      return !this.isPreventAllDamage && !this.isGetDamageFromDataCollector
    }
  })
  damageToPrevent: number = 1;

  @property({ visible: function (this: PreventDamagePassive) { return !this.isPreventAllDamage } })
  isGetDamageFromDataCollector: boolean = false
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