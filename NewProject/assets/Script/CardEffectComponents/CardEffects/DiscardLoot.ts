import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
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
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData) {
    let targetLoots: cc.Node[] = data.getTargets(TARGETTYPE.CARD)
    if (targetLoots.length == 0) {
      cc.log(`no targets`)
    } else {
      let player: Player
      for (let i = 0; i < targetLoots.length; i++) {
        const lootToDiscard = targetLoots[i];
        player = PlayerManager.getPlayerByCard(lootToDiscard)
        await player.discardLoot(lootToDiscard, true)
      }
    }
    return stack
  }
}
