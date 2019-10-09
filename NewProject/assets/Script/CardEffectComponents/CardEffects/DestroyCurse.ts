import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DestroyCurse extends Effect {
  effectName = "DestroyCurse";



  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    let targetCurses = data.getTargets(TARGETTYPE.CARD)
    if (targetCurses.length == 0) {
      cc.log(`no targets`)
    } else {
      let player: Player
      for (let i = 0; i < targetCurses.length; i++) {
        const curse = targetCurses[i];
        player = PlayerManager.getPlayerByCard(curse as cc.Node)
        await player.removeCurse(curse as cc.Node, true)
      }
    }

    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
