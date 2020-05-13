import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import BattleManager from "../../Managers/BattleManager";
import Stack from "../../Entites/Stack";
import TurnsManager from "../../Managers/TurnsManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EndTurn extends Effect {
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

    if (data) {
      const player = data.getTarget(TARGETTYPE.PLAYER)
      if (player && TurnsManager.getCurrentTurn().getTurnPlayer().character != player) {
        if (data instanceof PassiveEffectData) { return data }
        return stack
      }
    }

    if (this.isCancelAttack) {
      await BattleManager.cancelAttack(true)
    }

    if (this.isCancelAllStackEffects) {
      Stack._currentStack.forEach(async stackEffect => {
        await Stack.fizzleStackEffect(stackEffect, true)
      })
    }

    TurnsManager.currentTurn.getTurnPlayer()._endTurnFlag = true



    if (data instanceof PassiveEffectData) { return data }
    return stack
  }
}
