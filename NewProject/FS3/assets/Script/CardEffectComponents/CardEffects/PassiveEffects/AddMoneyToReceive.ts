import { _decorator, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

import { PassiveEffectData } from "../../../Managers/PassiveEffectData";
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { PassiveEffect } from "../PassiveEffect";

@ccclass('AddMoneyToReceive')
export class AddMoneyToReceive extends PassiveEffect {
  effectName = "AddMoneyToReceive";
  @property(CCInteger)
  numOfCoins: number = 0;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    if (!data) { debugger; throw new Error("Data Is Undef"); }
    let terminateOriginal = data.terminateOriginal;
    let args = data.methodArgs;
    //should be money count
    args[0] = args[0] + this.numOfCoins
    return data
  }
}
