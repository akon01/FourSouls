import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargeItem extends Effect {
  effectName = "RechargeItem";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(serverEffectStack: ServerEffect[], data?: { target: number }) {
    let targetItem = CardManager.getCardById(data.target);
    let cardPlayer = PlayerManager.getPlayerByCard(targetItem);
    cardPlayer.rechargeItem(targetItem);

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
