import { Node, _decorator } from 'cc';
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('RechargeItem')
export class RechargeItem extends Effect {
  effectName = "RechargeItem";
  chooseType: CHOOSE_CARD_TYPE = CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data"); }
    let targetItems = data.getTargets(TARGETTYPE.ITEM) as Node[];
    if (targetItems.length == 0) {
      targetItems = data.getTargets(TARGETTYPE.PLAYER) as Node[]
      if (targetItems.length == 0) {
        throw new CardEffectTargetError(`No Items To Recharge found`, true, data, stack)
      }
    }
    for (const targetItem of targetItems) {
      const cardPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetItem)!;
      await cardPlayer.rechargeItem(targetItem, true);
    }

    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}