import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { CardManager } from "../../Managers/CardManager";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { BattleManager } from "../../Managers/BattleManager";
import { Stack } from "../../Entites/Stack";
import { TurnsManager } from "../../Managers/TurnsManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('EndTurn')
export class EndTurn extends Effect {
  effectName = "EndTurn";
  @property
  isCancelAllStackEffects: boolean = false;
  @property
  isCancelAttack: boolean = false
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    if (!data) { debugger; throw new Error("No Data!"); }
    const player = data.getTarget(TARGETTYPE.PLAYER)
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