import StackEffectInterface from "../../../StackEffects/StackEffectInterface";

import Effect from "../Effect";
import DataCollector from "../../DataCollector/DataCollector";
import { PassiveEffectData } from "../../../Managers/DataInterpreter";


const { ccclass, property } = cc._decorator;

@ccclass('PreventDamagePassive')
export default class PreventDamagePassive extends Effect {
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
    if (!this.isPreventAllDamage) {
      data.methodArgs[0] -= this.damageToPrevent
    } else {
      data.methodArgs[0] = 0
    }

    return data
  }
}
