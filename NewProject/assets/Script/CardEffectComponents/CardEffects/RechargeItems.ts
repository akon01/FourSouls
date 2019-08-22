import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import ChooseCard from "../DataCollector/ChooseCard";
import { Turn } from "../../Modules/TurnsModule";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargeItems extends Effect {
  effectName = "RechargeItems";




  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData) {
    //let targetItemsId: number[] = data.targets;
    let cardPlayer: Player;
    let itemsToRecharge = data.getTargets(TARGETTYPE.ITEM)

    if (itemsToRecharge.length == 0) {
      cc.log(`no items to recharge`)
    } else {

      for (let i = 0; i < itemsToRecharge.length; i++) {
        const item = itemsToRecharge[i];
        if (item instanceof cc.Node) {
          cardPlayer = PlayerManager.getPlayerByCard(item);
          await cardPlayer.rechargeItem(item, true)
        }
      }
    }
    return stack
  }
}
