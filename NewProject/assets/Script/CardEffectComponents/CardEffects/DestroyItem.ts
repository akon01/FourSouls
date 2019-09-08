import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DestroyItem extends Effect {
  effectName = "DestroyItem";



  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData) {
    let targetItems = data.getTargets(TARGETTYPE.ITEM)
    if (targetItems.length == 0) {
      cc.log(`no targets`)
    } else {
      let player: Player
      for (let i = 0; i < targetItems.length; i++) {
        const item = targetItems[i];
        player = PlayerManager.getPlayerByCard(item as cc.Node)
        await player.destroyItem(item as cc.Node, true)
      }
    }
    return stack
  }
}
