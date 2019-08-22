import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import ChooseCard from "../DataCollector/ChooseCard";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargeItem extends Effect {
  effectName = "RechargeItem";

  chooseType: CHOOSE_CARD_TYPE = CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData) {
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
