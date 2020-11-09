import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import TurnsManager from "../../Managers/TurnsManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChangeSoulsNeededToWin extends Effect {
  effectName = "ChangeSoulsNeededToWin";

  @property(cc.Integer)
  numOfSouls: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      throw new Error(`target player is null`)
    } else {
      const player: Player = PlayerManager.getPlayerByCard(targetPlayerCard as cc.Node)
      player._extraSoulsNeededToWin += this.numOfSouls
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }

}