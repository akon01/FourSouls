import { _decorator, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { Stack } from "../../../Entites/Stack";
import { PassiveEffectData } from "../../../Managers/PassiveEffectData";
import { PlayerManager } from "../../../Managers/PlayerManager";
import { TurnsManager } from "../../../Managers/TurnsManager";
import { PlayerDeathPenalties } from "../../../StackEffects/PlayerDeathPenalties";
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { Effect } from "../Effect";
import { TARGETTYPE } from "../../../Constants";
import { WrapperProvider } from '../../../Managers/WrapperProvider';

@ccclass('PreventDeathPanelties')
export class PreventDeathPanelties extends Effect {
  effectName = "PreventDeathPanelties";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const targetPlayer = data.getTarget(TARGETTYPE.PLAYER) as Node
    if (!targetPlayer) { throw new Error(`No target player found`) }
    const playerPenaltiesStackEffect = WrapperProvider.stackWrapper.out._currentStack.find(effect => {
      if (effect instanceof PlayerDeathPenalties && effect.playerToPay.playerId == WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayer as Node)!.playerId) { return true }
    })
    if (!playerPenaltiesStackEffect) { throw new Error(`No Player Penalties found`) }
    await WrapperProvider.stackWrapper.out.fizzleStackEffect(playerPenaltiesStackEffect, true, true)
    if (playerPenaltiesStackEffect instanceof PlayerDeathPenalties) {
      const playerToPay = playerPenaltiesStackEffect.playerToPay
      playerToPay.heal(playerToPay._lastHp, true, true)
      console.log(`if player is turn player end their turn`)
      if (WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!.playerId == playerToPay.playerId) {
        console.log(`end turn`)
        //   WrapperProvider.stackWrapper.out.removeFromCurrentStackEffectResolving()
        //  playerToPay.endTurn(true);
        playerToPay._endTurnFlag = true
      }
    }
    data.terminateOriginal = true;

    return data
  }
}
