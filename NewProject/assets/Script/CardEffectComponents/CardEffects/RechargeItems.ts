import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { CHOOSE_TYPE, TARGETTYPE } from "../../Constants";
import ChooseCard from "../DataCollector/ChooseCard";
import { Turn } from "../../Modules/TurnsModule";
import { ActiveEffectData } from "../../Managers/NewScript";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargeItems extends Effect {
  effectName = "RechargeItems";




  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(serverEffectStack: ServerEffect[], data?: ActiveEffectData) {
    //let targetItemsId: number[] = data.targets;
    let cardPlayer: Player;
    let itemsToRecharge = data.getTargets(TARGETTYPE.ITEM)
    for (let i = 0; i < itemsToRecharge.length; i++) {
      const item = itemsToRecharge[i];
      cardPlayer = PlayerManager.getPlayerByCard(item);
      await cardPlayer.rechargeItem(item, true)
    }
    return serverEffectStack
  }
}
