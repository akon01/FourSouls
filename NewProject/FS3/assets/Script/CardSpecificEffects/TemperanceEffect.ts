import { _decorator, Node, log } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { TARGETTYPE } from "../Constants";
import { Player } from '../Entites/GameEntities/Player';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { CardManager } from '../Managers/CardManager';
import { PassiveEffectData } from '../Managers/PassiveEffectData';

import { PlayerManager } from '../Managers/PlayerManager';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
const { ccclass, property } = _decorator;


@ccclass('TemperanceEffect')
export class TemperanceEffect extends Effect {
  effectName = "TemperanceEffect";
  @property
  dmgToTake = 0;
  @property
  moneyToGet = 0
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {
    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
    if (targetPlayerCard == null) {
      console.log(`no target player`)
    } else {
      const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard as Node)!
      const owner = WrapperProvider.cardManagerWrapper.out.getCardOwner(this.node)!
      const dmgToTake = this.getQuantityInRegardsToBlankCard(player.node,this.dmgToTake)
      const moneyToGet = this.getQuantityInRegardsToBlankCard(player.node,this.moneyToGet)
      await player.takeDamage(dmgToTake, true, owner)
      await player.changeMoney(moneyToGet, true)
    }
    return stack
  }
}
