import { PassiveEffectData } from "../../../Managers/DataInterpreter";
import Effect from "../Effect";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../../Constants";
import StackEffectInterface from "../../../StackEffects/StackEffectInterface";
import PlayerManager from "../../../Managers/PlayerManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargeItem extends Effect {
  effectName = "RechargeItem";

  chooseType: CHOOSE_CARD_TYPE = CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    let targetItem
    targetItem = data.getTarget(TARGETTYPE.ITEM);
    if (targetItem == null) {
      cc.log(`no item to recharge`)
    } else {
      let cardPlayer = PlayerManager.getPlayerByCard(targetItem);
      await cardPlayer.rechargeItem(targetItem, true);
    }

    return stack
  }
}
