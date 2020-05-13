import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GainBonusSoul extends Effect {
  effectName = "GainBonusSoul";

  @property(cc.Node)
  soulCardToGain: cc.Node = null;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
    if (targetPlayerCard == null) {
      throw new Error(`no target player`)
    } else {
      if (targetPlayerCard instanceof cc.Node) {
        let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard)
        await player.getSoulCard(this.soulCardToGain, true)
      }


      if (data instanceof PassiveEffectData) { return data }
      return stack
    }
  }
}