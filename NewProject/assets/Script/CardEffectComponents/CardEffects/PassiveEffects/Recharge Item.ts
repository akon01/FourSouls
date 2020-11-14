import { PassiveEffectData, ActiveEffectData } from "../../../Managers/DataInterpreter";
import Effect from "../Effect";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../../Constants";
import StackEffectInterface from "../../../StackEffects/StackEffectInterface";
import PlayerManager from "../../../Managers/PlayerManager";
import Stack from "../../../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass('RechargeItemPassive')
export default class RechargeItemPassive extends Effect {
  effectName = "RechargeItemPassive";

  chooseType: CHOOSE_CARD_TYPE = CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    let targetItem
    targetItem = data.getTarget(TARGETTYPE.ITEM);
    if (targetItem == null) {
      cc.log(`no item to recharge`)
    } else {
      let cardPlayer = PlayerManager.getPlayerByCard(targetItem);
      await cardPlayer.rechargeItem(targetItem, true);
    }


    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
