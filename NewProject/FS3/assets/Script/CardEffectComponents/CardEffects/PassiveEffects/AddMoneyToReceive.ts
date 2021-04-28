import { CCInteger, _decorator } from 'cc';
import { PassiveEffectData } from "../../../Managers/PassiveEffectData";
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { PassiveEffect } from "../PassiveEffect";
const { ccclass, property } = _decorator;


@ccclass('AddMoneyToReceive')
export class AddMoneyToReceive extends PassiveEffect {
  effectName = "AddMoneyToReceive";
  @property(CCInteger)
  numOfCoins = 0;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    if (!data) { debugger; throw new Error("Data Is Undef"); }
    const terminateOriginal = data.terminateOriginal;
    const args = data.methodArgs;
    //should be money count
    args[0] = args[0] + this.numOfCoins
    return data
  }
}
