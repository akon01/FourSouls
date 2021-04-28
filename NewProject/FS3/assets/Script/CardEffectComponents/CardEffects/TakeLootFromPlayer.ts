import { Node, _decorator } from 'cc';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('TakeLootFromPlayer')
export class TakeLootFromPlayer extends Effect {
  effectName = "TakeLootFromPlayer";
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }
    const targets = data.getTargets(TARGETTYPE.CARD)
    if (targets.length == 0) {
      throw new CardEffectTargetError(`No Targets found`, true, data, stack)
    }
    const playerCard = targets[1]
    const cardToTake = targets[0]
    const playerToGiveTo = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard as Node)!
    if (playerToGiveTo == null) {
      throw new Error(`player to give to is null`)
    } else {

      const playerToTakeFrom = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardToTake as Node)!

      await playerToTakeFrom.loseLoot(cardToTake as Node, true)

      await WrapperProvider.cardManagerWrapper.out.moveCardTo(cardToTake as Node, playerToGiveTo.hand!.node, true, false)
      await playerToGiveTo.gainLoot(cardToTake as Node, true)
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
