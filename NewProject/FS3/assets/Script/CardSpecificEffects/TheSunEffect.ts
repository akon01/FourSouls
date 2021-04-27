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


@ccclass('TheSunEffect')
export class TheSunEffect extends Effect {
  effectName = "TheSunEffect";

  @property
  numOfTurnsToGive = 1

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
     // const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard as Node)!
      const owner =WrapperProvider.playerManagerWrapper.out.getPlayerByCard(WrapperProvider.cardManagerWrapper.out.getCardOwner(this.node)!)!
      for (let index = 0; index < this.numOfTurnsToGive; index++) {
        WrapperProvider.turnsManagerWrapper.out.addOneTimeTurn(owner.playerId,true)  
      }
      // const dmgToTake = this.getQuantityInRegardsToBlankCard(player.node,this.dmgToTake)
      // const moneyToGet = this.getQuantityInRegardsToBlankCard(player.node,this.moneyToGet)
      // await player.takeDamage(dmgToTake, true, owner)
      // await player.changeMoney(moneyToGet, true)
    }
    return stack
  }
}
