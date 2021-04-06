import { _decorator, CCInteger, Node } from 'cc';
const { ccclass, property } = _decorator;

import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { TurnsManager } from "../../Managers/TurnsManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { TARGETTYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PlayerManager } from "../../Managers/PlayerManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('AddBuyOpportunity')
export class AddBuyOpportunity extends Effect {
  effectName = "AddBuyOpportunity";
  @property(CCInteger)
  numOfTimes = 0;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      throw new Error(`target player is null`)
    } else {
      const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard as Node)!
      player.buyPlays += this.getQuantityInRegardsToBlankCard(player.node, this.numOfTimes)
      if (data instanceof PassiveEffectData) { return data }
      return stack
    }
  }
}