import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargeItem extends Effect {
  effectName = "RechargeItem";

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
