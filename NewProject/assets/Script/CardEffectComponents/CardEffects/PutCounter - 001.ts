import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { CHOOSE_TYPE } from "../../Constants";
import ChooseCard from "../DataCollector/ChooseCard";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PutCounter extends Effect {
  effectName = "PutCounter";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  @property
  howManyCountersToAdd: number = 1;

  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(serverEffectStack: ServerEffect[], data?) {
    let targetItem: cc.Node
    if (this.dataCollector instanceof ChooseCard) {
      targetItem = CardManager.getCardById(data.cardChosenId, true);
    } else {

      targetItem = CardManager.getCardById(data.target, true);
    }

    targetItem.getComponent(Card)._counters += this.howManyCountersToAdd;
    // let cardPlayer = PlayerManager.getPlayerByCard(targetItem);
    // cardPlayer.rechargeItem(targetItem, true);

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
