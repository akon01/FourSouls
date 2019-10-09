import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import TurnsManager from "../../Managers/TurnsManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class AddAttackOpportunity extends Effect {
  effectName = "AddAttackOpportunity";

  @property(Number)
  numOfTimes: number = 0;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {


    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      cc.log(`target player is null`)
    } else {
      let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard as cc.Node)
      TurnsManager.currentTurn.attackPlays += this.numOfTimes
    }

    if (data instanceof PassiveEffectData) return data
    return stack
  }

}
