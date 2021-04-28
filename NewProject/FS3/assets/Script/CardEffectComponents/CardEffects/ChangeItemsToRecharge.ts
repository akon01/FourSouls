import { CCInteger, Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('ChangeItemsToRecharge')
export class ChangeItemsToRecharge extends Effect {
  effectName = "ChangeItemsToRechage";
  @property(CCInteger)
  numOfItems = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    if (!data) { debugger; throw new Error("No Data!"); }
    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      throw new CardEffectTargetError(`target player is null`, true, data, stack)
    } else {
      const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard as Node)!
      player.setNumOfItemsToRecharge(this.getQuantityInRegardsToBlankCard(player.node, this.numOfItems), true)
    }

    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
