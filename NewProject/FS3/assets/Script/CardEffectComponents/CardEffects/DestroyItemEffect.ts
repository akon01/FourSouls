import { _decorator, CCInteger, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { Stack } from "../../Entites/Stack";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('DestroyItemEffect')
export class DestroyItemEffect extends Effect {
  effectName = "DestroyItem";
  @property(CCInteger)
  numberOfItemsToDestroy: number = 1
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    let targetItems = data.getTargets(TARGETTYPE.ITEM)
    if (targetItems.length == 0) {
      log(`no targets`)
    } else {
      let player: Player
      for (let i = 0; i < targetItems.length; i++) {
        const item = targetItems[i];
        player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(item as Node)!
        await player.destroyItem(item as Node, true)
        if (i + 1 == this.numberOfItemsToDestroy) break;
      }
    }


    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
