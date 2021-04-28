import { Node, _decorator } from 'cc';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('StealItemFromPlayer')
export class StealItemFromPlayer extends Effect {
  effectName = "StealItemFromPlayer";
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }
    const playerToGiveToTarget = data.getTarget(TARGETTYPE.PLAYER) as Node | null;
    if (!playerToGiveToTarget) {
      throw new CardEffectTargetError(`No Player To Give To Target found`, true, data, stack)
    }
    const playerToGiveTo: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard((playerToGiveToTarget))!
    const cardToTake = data.getTarget(TARGETTYPE.ITEM) as Node;
    // p1 choose which loot to get.
    const playerToTakeFrom = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardToTake)!
    await playerToTakeFrom.loseItem(cardToTake, true)
    await playerToGiveTo.addItem(cardToTake, true, true)

    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
