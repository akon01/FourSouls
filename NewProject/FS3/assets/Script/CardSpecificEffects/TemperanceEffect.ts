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
  dmgToTake: number = 0;
  @property
  moneyToGet: number = 0
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {
    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
    if (targetPlayerCard == null) {
      console.log(`no target player`)
    } else {
      let player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard as Node)!
      let owner = WrapperProvider.cardManagerWrapper.out.getCardOwner(this.node)!
      await player.takeDamage(this.dmgToTake, true, owner)
      await player.changeMoney(this.moneyToGet, true)
    }
    return stack
  }
}
