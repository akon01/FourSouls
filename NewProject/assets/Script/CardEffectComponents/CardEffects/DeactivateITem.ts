import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import Item from "../../Entites/CardTypes/Item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DeactivateItem extends Effect {
  effectName = "DeactivateItem";

  chooseType: CHOOSE_CARD_TYPE = CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    let targetItem = data.getTarget(TARGETTYPE.ITEM);
    if (targetItem == null) {
      targetItem = data.getTarget(TARGETTYPE.CARD);
    }
    if (targetItem == null) {
      throw new Error(`no item to deactivate`)
    } else {
      //let cardPlayer = PlayerManager.getPlayerByCard(targetItem as cc.Node);
      (targetItem as cc.Node).getComponent(Item).useItem(true)
      //await cardPlayer.rechargeItem(targetItem, true);
    }

    if (data instanceof PassiveEffectData) {
      return data
    } else { return stack }
  }
}
