import Effect from "../CardEffectComponents/CardEffects/Effect";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import { ActiveEffectData } from "../Managers/DataInterpreter";
import { TARGETTYPE } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import PlayerManager from "../Managers/PlayerManager";



const { ccclass, property } = cc._decorator;

@ccclass("DoublePlayerMoney")
export default class DoublePlayerMoney extends Effect {
  effectName = "DoublePlayerMoney";



  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData) {


    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      cc.log(`target player is null`)
    } else {
      if (targetPlayerCard instanceof cc.Node) {
        let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard)
        await player.changeMoney(player.coins, true);
      }
    }
    return stack
  }
}
