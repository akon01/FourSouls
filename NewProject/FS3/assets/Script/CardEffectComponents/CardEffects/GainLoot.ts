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
  numOfLoot: number = 0;
  @property
  multiTarget: boolean = false;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    if (this.multiTarget) {
      let targets = data.getTargets(TARGETTYPE.PLAYER)
      if (targets.length == 0) {
        log(`no targets`)
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
      let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
      if (targetPlayerCard == null) {
        log(`no target player`)
        if (data instanceof PassiveEffectData) return data
        return stack
      } else {
        if (targetPlayerCard instanceof Node) {
          let player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard)!
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