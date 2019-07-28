import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { CHOOSE_TYPE, TARGETTYPE } from "../../Constants";
import ChooseCard from "../DataCollector/ChooseCard";
import { ActiveEffectData } from "../../Managers/NewScript";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargeItem extends Effect {
  effectName = "RechargeItem";

  chooseType: CHOOSE_TYPE = CHOOSE_TYPE.ALLPLAYERSITEMS;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(serverEffectStack: ServerEffect[], data?: ActiveEffectData) {
    let targetItem
    // if (this.dataCollector instanceof ChooseCard) {
    //   targetItem = CardManager.getCardById(data.cardChosenId, true);
    // } else {

    targetItem = data.getTarget(TARGETTYPE.ITEM);
    // }
    let cardPlayer = PlayerManager.getPlayerByCard(targetItem);
    await cardPlayer.rechargeItem(targetItem, true);

    return serverEffectStack
  }
}
