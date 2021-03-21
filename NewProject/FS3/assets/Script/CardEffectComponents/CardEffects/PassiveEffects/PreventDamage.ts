import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { Effect } from "../Effect";
import { DataCollector } from "../../DataCollector/DataCollector";
import { PassiveEffectData } from "../../../Managers/PassiveEffectData";

@ccclass('PreventDamagePassive')
export class PreventDamagePassive extends Effect {
  effectName = "PreventDamagePassive";
  @property
  isPreventAllDamage: boolean = false;
  @property({
    visible: function (this: PreventDamagePassive) {
      return !this.isPreventAllDamage
    }
  })
  damageToPrevent: number = 1;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }

    if (!this.isPreventAllDamage) {
      data.methodArgs[0] -= this.damageToPrevent
    } else {
      data.methodArgs[0] = 0
    }

    return data
  }
}