import { _decorator, CCInteger, Node } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE, CARD_TYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { Stack } from "../../Entites/Stack";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('DiscardLoot')
export class DiscardLoot extends Effect {
  effectName = "DiscardLoot";
  @property(CCInteger)
  numOfLoot: number = 0;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const targetLoots = data.getTargets(TARGETTYPE.CARD)
    if (targetLoots.length == 0) {
      throw new Error(`no targets`)
    } else {
      let player: Player
      for (let i = 0; i < targetLoots.length; i++) {
        const lootToDiscard = targetLoots[i];
        if ((lootToDiscard as Node).getComponent(Card)!.type != CARD_TYPE.LOOT) { continue }
        player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(lootToDiscard as Node)!
        await player.discardLoot(lootToDiscard as Node, true)
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
