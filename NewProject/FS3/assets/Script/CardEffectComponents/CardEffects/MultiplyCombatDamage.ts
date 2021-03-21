import { CCInteger, _decorator } from 'cc';
import { Stack } from "../../Entites/Stack";
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('MultiplyCombatDamage')
export class MultiplyCombatDamage extends Effect {
  effectName = "MultiplyCombatDamage";
  @property(CCInteger)
  multiplier: number = 0;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }
    data.methodArgs[0] = data.methodArgs[0] * this.multiplier
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
