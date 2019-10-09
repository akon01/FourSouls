import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DiscardLoot extends Effect {
  effectName = "DiscardLoot";



  @property(Number)
  numOfLoot: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    let targetLoots = data.getTargets(TARGETTYPE.CARD)
    if (targetLoots.length == 0) {
      cc.log(`no targets`)
    } else {
      let player: Player
      for (let i = 0; i < targetLoots.length; i++) {
        const lootToDiscard = targetLoots[i];
        player = PlayerManager.getPlayerByCard(lootToDiscard as cc.Node)
        await player.discardLoot(lootToDiscard as cc.Node, true)
      }
    }

    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
