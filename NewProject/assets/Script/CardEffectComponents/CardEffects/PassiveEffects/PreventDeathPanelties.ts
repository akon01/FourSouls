import Stack from "../../../Entites/Stack";
import { PassiveEffectData } from "../../../Managers/DataInterpreter";
import PlayerManager from "../../../Managers/PlayerManager";
import TurnsManager from "../../../Managers/TurnsManager";
import PlayerDeathPenalties from "../../../StackEffects/Player Death Penalties";
import StackEffectInterface from "../../../StackEffects/StackEffectInterface";
import DataCollector from "../../DataCollector/DataCollector";
import Effect from "../Effect";
import { TARGETTYPE } from "../../../Constants";



const { ccclass, property } = cc._decorator;

@ccclass
export default class PreventDeathPenalties extends Effect {
  effectName = "PreventDeathPenalties";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {

    let targetPlayer = data.getTarget(TARGETTYPE.PLAYER)
    if (!targetPlayer) throw `No target player found`
    let playerPenaltiesStackEffect = Stack._currentStack.find(effect => {
      if (effect instanceof PlayerDeathPenalties && effect.playerToPay.playerId == PlayerManager.getPlayerByCard(targetPlayer as cc.Node).playerId) return true
    })
    if (!playerPenaltiesStackEffect) throw `No Player Penalties found`
    await Stack.fizzleStackEffect(playerPenaltiesStackEffect, true)
    if (playerPenaltiesStackEffect instanceof PlayerDeathPenalties) {
      cc.log(`if player is turn player end their turn`)
      let playerToPay = playerPenaltiesStackEffect.playerToPay
      if (TurnsManager.currentTurn.getTurnPlayer().playerId == playerToPay.playerId) {
        cc.log(`end turn`)
        //   Stack.removeFromCurrentStackEffectResolving()
        playerToPay.endTurn(true);
      }
    }
    data.terminateOriginal = true;

    return data
  }
}
