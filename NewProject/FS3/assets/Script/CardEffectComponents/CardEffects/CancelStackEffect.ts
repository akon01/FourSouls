import { _decorator, Node } from 'cc';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
const { ccclass, property } = _decorator;

import { Stack } from "../../Entites/Stack";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";

@ccclass('CancelStackEffect')
export class CancelStackEffect extends Effect {
  effectName = "CancelStackEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const targetStackEffectToCancel = data.getTarget(TARGETTYPE.STACK_EFFECT)
    if (targetStackEffectToCancel == null) {
      throw new CardEffectTargetError(`target stack effect is null`, true, data, stack)
    } else {
      if (!(targetStackEffectToCancel instanceof Node)) {
        await WrapperProvider.stackWrapper.out.fizzleStackEffect(targetStackEffectToCancel as StackEffectInterface, true, true)
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
