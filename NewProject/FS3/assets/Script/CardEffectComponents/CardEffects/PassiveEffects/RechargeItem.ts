import { log, _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;


import { Effect } from "../Effect";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../../Constants";
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { PlayerManager } from "../../../Managers/PlayerManager";
import { Stack } from "../../../Entites/Stack";
import { ActiveEffectData } from '../../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../../Managers/WrapperProvider';

@ccclass('RechargeItemPassive')
export class RechargeItemPassive extends Effect {
  effectName = "RechargeItemPassive";
  chooseType: CHOOSE_CARD_TYPE = CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    let targetItem: Node | null = null
    if (!data) { debugger; throw new Error("No Data!"); }
    targetItem = data.getTarget(TARGETTYPE.ITEM) as Node;
    if (targetItem == null) {
      console.log(`no item to recharge`)
    } else {
      let cardPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetItem)!;
      await cardPlayer.rechargeItem(targetItem, true);
    }


    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
