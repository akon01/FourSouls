import { Node, _decorator } from 'cc';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('TakeSoulCardFromPlayer')
export class TakeSoulCardFromPlayer extends Effect {
  effectName = "TakeSoulCardFromPlayer";
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
      throw new CardEffectTargetError(`No Card Targets found`, true, data, stack)
    }
    const playerCard = targets[1]
    const cardToTake = targets[0]
    const playerToGiveTo = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard as Node)
    if (playerToGiveTo == null) {
      throw new Error(`player to give to is null`)
    } else {
      const playerToTakeFrom = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardToTake as Node)!
      await playerToTakeFrom.loseSoul(cardToTake as Node, true)
      await playerToGiveTo.receiveSoulCard(cardToTake as Node, true)
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
