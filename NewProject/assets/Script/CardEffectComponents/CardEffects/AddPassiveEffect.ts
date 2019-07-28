import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import PassiveEffect from "../../PassiveEffects/PassiveEffect";
import PassiveManager from "../../Managers/PassiveManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddPassiveEffect extends Effect {
  effectName = "AddPassiveEffect";

  @property({ type: Effect, override: true })
  passiveEffectToAdd: Effect = null;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(serverEffectStack: ServerEffect[], data?) {

    this.passiveEffectToAdd.condition.conditionData = data;
    await PassiveManager.registerOneTurnPassiveEffect(this.passiveEffectToAdd, true)
    // let cardPlayer = PlayerManager.getPlayerByCard(targetItem);
    //cardPlayer.rechargeItem(targetItem);
    cc.log(`registered one turn passive ${this.passiveEffectToAdd.name}`)
    return serverEffectStack
  }
}
