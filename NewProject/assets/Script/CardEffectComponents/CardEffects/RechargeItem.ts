import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { CHOOSE_TYPE } from "../../Constants";
import ChooseCard from "../DataCollector/ChooseCard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargeItem extends Effect {
  effectName = "RechargeItem";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  chooseType: CHOOSE_TYPE = CHOOSE_TYPE.ALLPLAYERITEMS;

  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(serverEffectStack: ServerEffect[], data?) {
    let targetItem
    if (this.dataCollector instanceof ChooseCard) {
      targetItem = CardManager.getCardById(data.cardChosenId, true);
    } else {

      targetItem = CardManager.getCardById(data.target, true);
    }
    let cardPlayer = PlayerManager.getPlayerByCard(targetItem);
    cardPlayer.rechargeItem(targetItem);

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
