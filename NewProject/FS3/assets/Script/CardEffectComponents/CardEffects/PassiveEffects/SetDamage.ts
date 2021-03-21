import { _decorator } from 'cc';
import { PassiveEffectData } from "../../../Managers/PassiveEffectData";
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { Effect } from "../Effect";
const { ccclass, property } = _decorator;


@ccclass('SetDamage')
export class SetDamage extends Effect {
  effectName = "SetDamage";
  @property
  damageToSet: number = 1;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    data.methodArgs[0] = this.damageToSet

    return data
  }
}
