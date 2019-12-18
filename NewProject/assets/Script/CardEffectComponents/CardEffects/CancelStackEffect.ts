import Stack from "../../Entites/Stack";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CancelStackEffect extends Effect {

  effectName = "CancelStackEffect";


  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    let targetStackEffectToCancel = data.getTarget(TARGETTYPE.STACK_EFFECT)
    if (targetStackEffectToCancel == null) {
      cc.log(`no target stack effect`)
    } else {
      if (!(targetStackEffectToCancel instanceof cc.Node)) {
        await Stack.fizzleStackEffect(targetStackEffectToCancel, true)
      }
    }



    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
