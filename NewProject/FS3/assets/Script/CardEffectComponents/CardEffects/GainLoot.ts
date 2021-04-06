import { _decorator, CCInteger, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { CardManager } from "../../Managers/CardManager";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('GainLoot')
export class GainLoot extends Effect {
  effectName = "GainLoot";
  @property(CCInteger)
  numOfLoot = 0;
  @property
  multiTarget = false;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    if (this.multiTarget) {
      const targets = data.getTargets(TARGETTYPE.PLAYER)
      if (targets.length == 0) {
        console.log(`no targets`)
        if (data instanceof PassiveEffectData) return data
        return stack
      }
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        for (let j = 0; j < this.numOfLoot; j++) {
          await WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target as Node)!.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true)
        }
      }

    } else {
      const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
      if (targetPlayerCard == null) {
        console.log(`no target player`)
        if (data instanceof PassiveEffectData) return data
        return stack
      } else {
        if (targetPlayerCard instanceof Node) {
          const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard)!
          for (let i = 0; i < this.numOfLoot; i++) {
            await player.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true)
          }
        }
      }

    }
    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
