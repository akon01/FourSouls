import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { CHOOSE_TYPE, TARGETTYPE } from "../../Constants";
import ChooseCard from "../DataCollector/ChooseCard";
import Card from "../../Entites/GameEntities/Card";
import { ActiveEffectData } from "../../Managers/NewScript";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PutCounter extends Effect {
  effectName = "PutCounter";

  @property
  howManyCountersToAdd: number = 1;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(serverEffectStack: ServerEffect[], data?: ActiveEffectData) {
    let targetItem: cc.Node
    //if (this.dataCollector instanceof ChooseCard) {
    // targetItem = CardManager.getCardById(data.cardChosenId, true);
    // } else {

    targetItem = data.getTarget(TARGETTYPE.ITEM)
    // }

    targetItem.getComponent(Card)._counters += this.howManyCountersToAdd;
    // let cardPlayer = PlayerManager.getPlayerByCard(targetItem);
    // cardPlayer.rechargeItem(targetItem, true);

    return serverEffectStack
  }
}
