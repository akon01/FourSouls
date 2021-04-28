import { _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('EndTurn')
export class EndTurn extends Effect {
  effectName = "EndTurn";
  @property
  isCancelAllStackEffects = false;
  @property
  isCancelAttack = false
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    if (!data) { debugger; throw new Error("No Data!"); }
    const player = data.getTarget(TARGETTYPE.PLAYER)
    if (!player) {
      throw new CardEffectTargetError(`No Target Player Found`, true, data, stack)
    }
    if (player && WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.getTurnPlayer()!.character! != player) {
      if (data instanceof PassiveEffectData) { return data }
      return stack
    }


    if (this.isCancelAttack) {
      await WrapperProvider.battleManagerWrapper.out.cancelAttack(true)
    }

    if (this.isCancelAllStackEffects) {
      WrapperProvider.stackWrapper.out._currentStack.forEach(async stackEffect => {
        await WrapperProvider.stackWrapper.out.fizzleStackEffect(stackEffect, true, true)
      })
    }

    WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!._endTurnFlag = true



    if (data instanceof PassiveEffectData) { return data }
    return stack
  }
}