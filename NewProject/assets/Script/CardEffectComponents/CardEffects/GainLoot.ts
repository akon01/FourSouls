import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GainLoot extends Effect {
  effectName = "GainLoot";

  @property(Number)
  numOfLoot: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData) {
    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
    if (targetPlayerCard == null) {
      cc.log(`no target player`)
    } else {
      let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard)
      for (let i = 0; i < this.numOfLoot; i++) {
        await player.drawCard(CardManager.lootDeck, true)
      }
    }

    return stack
  }
}
