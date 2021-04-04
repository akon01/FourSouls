import { _decorator, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { ActiveEffectData } from "../Managers/ActiveEffectData";
import { TARGETTYPE } from "../Constants";
import { Player } from "../Entites/GameEntities/Player";
import { PlayerManager } from "../Managers/PlayerManager";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('DoublePlayerMoney')
export class DoublePlayerMoney extends Effect {
  effectName = "DoublePlayerMoney";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData) {


    if (!data) { debugger; throw new Error("No Data"); }

    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      console.log(`target player is null`)
    } else {
      if (targetPlayerCard instanceof Node) {
        let player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard)!
        await player.changeMoney(player.coins, true);
      }
    }
    return stack
  }
}
