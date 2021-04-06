import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PassiveEffect } from "../PassiveEffect";
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { PassiveEffectData } from "../../../Managers/PassiveEffectData";

@ccclass('ChangeNumberOfDrawnCards')
export class ChangeNumberOfDrawnCards extends PassiveEffect {
      effectName = "ChangeNumberOfDrawnCards";
      @property({
            visible: function (this: ChangeNumberOfDrawnCards) {
                  return !this.isDoubleIncoming
            }
      })
      numOfCardsToAdd = 0;

      @property
      isDoubleIncoming = false;

      /**
       *
       * @param data {target:PlayerId}
       */
      async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
            if (!data) { debugger; throw new Error("Data Is Undef"); }
            // should be money count
            if (!this.isDoubleIncoming) {
                  data.methodArgs[0] = data.methodArgs[0] + this.numOfCardsToAdd
            } else {
                  data.methodArgs[0] = data.methodArgs[0] * 2
            }
            return data
      }
}
