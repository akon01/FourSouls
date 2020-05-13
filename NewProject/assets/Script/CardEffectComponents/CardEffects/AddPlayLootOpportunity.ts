import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import TurnsManager from "../../Managers/TurnsManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";
import Player from "../../Entites/GameEntities/Player";
import { TARGETTYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddPlayLootOpportunity extends Effect {
  effectName = "AddPlayLootOpportunity";

  @property(cc.Integer)
  numOfTimes: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    const playerCard = data.getTarget(TARGETTYPE.PLAYER) as cc.Node
    if (!playerCard) {
      throw new Error(`no Player to all loot plays to`)
    }
    const player = PlayerManager.getPlayerByCard(playerCard)
    player.lootCardPlays += this.numOfTimes;
    if (TurnsManager.isCurrentPlayer(player.node)) {
      TurnsManager.currentTurn.lootCardPlays = TurnsManager.currentTurn.lootCardPlays + this.numOfTimes
    }

    //  }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }

}
