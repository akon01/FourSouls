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
  doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    if (!data) { debugger; throw new Error("No Data!"); }
    const player = data.getTarget(TARGETTYPE.PLAYER)
    if (!player) {
      throw new CardEffectTargetError(`No Target Player Found`, true, data, stack)
    }
    this.currData = data
    this.currStack = stack
    if (player && WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.getTurnPlayer()!.character! != player) {
      return this.handleReturnValues()
    }



    if (this.isCancelAttack) {
      return WrapperProvider.battleManagerWrapper.out.cancelAttack(true).then(_ => {
        return this.handleCancelAll()
      })
    }

    return this.handleCancelAll()
  }

  handleCancelAll() {

    WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!._endTurnFlag = true
    if (this.isCancelAllStackEffects) {

      return this.handleTarget(0, WrapperProvider.stackWrapper.out._currentStack.length)
    }
    return this.handleReturnValues()
  }

  handleTarget(index: number, length: number) {
    const stackEffect = WrapperProvider.stackWrapper.out._currentStack[index]
    return WrapperProvider.stackWrapper.out.fizzleStackEffect(stackEffect, true, true).then(_ => {
      return this.handleAfterTarget(index++, length, this.handleTarget, this)
    })
  }
}