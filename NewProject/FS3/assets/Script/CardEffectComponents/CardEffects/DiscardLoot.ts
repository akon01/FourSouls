import { Node, _decorator } from 'cc';
import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Card } from "../../Entites/GameEntities/Card";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('DiscardLoot')
export class DiscardLoot extends Effect {
  effectName = "DiscardLoot";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const targetLoots = data.getTargets(TARGETTYPE.CARD)
    if (targetLoots.length == 0) {
      throw new CardEffectTargetError(`target loots to dicards are null`, true, data, stack)
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
