import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DestroyItemEffect extends Effect {
  effectName = "DestroyItem";


  @property(cc.Integer)
  numberOfItemsToDestroy: number = 1

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    let targetItems = data.getTargets(TARGETTYPE.ITEM)
    if (targetItems.length == 0) {
      cc.log(`no targets`)
    } else {
      let player: Player
      for (let i = 0; i < targetItems.length; i++) {
        const item = targetItems[i];
        player = PlayerManager.getPlayerByCard(item as cc.Node)
        await player.destroyItem(item as cc.Node, true)
        if (i + 1 == this.numberOfItemsToDestroy) break;
      }
    }

    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
