import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PassiveEffect } from "../PassiveEffect";
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { PassiveEffectData } from "../../../Managers/PassiveEffectData";

@ccclass('AddDamage')
export class AddDamage extends PassiveEffect {
      effectName = "AddDamage";
      @property({
            visible: function (this: AddDamage) {
                  return !this.isDoubleIncomingDamage
            }
      })
      damageToAdd: number = 0;

      @property
      isDoubleIncomingDamage: boolean = false;

      /**
       *
       * @param data {target:PlayerId}
       */
      async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
            if (!data) { debugger; throw new Error("Data Is Undef"); }
            let terminateOriginal = data.terminateOriginal;
            let args = data.methodArgs;
            // should be money count
            if (!this.isDoubleIncomingDamage) {
                  args[0] = args[0] + this.damageToAdd
            } else {
                  args[0] = args[0] * 2
            }
            return data
      }
}
