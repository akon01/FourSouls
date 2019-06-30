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

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  @property({ type: Effect, override: true })
  passiveEffectToAdd: Effect = null;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(serverEffectStack: ServerEffect[], data?) {

    // let thisCard = CardManager.getCardById(data.target, true);
    // 
    // let player = PlayerManager.getPlayerByCard(this.node.parent)

    // let conditionData = await this.passiveEffectToAdd.condition.dataCollector.collectData({ cardPlayerId: player.playerId });

    // let playerName = PlayerManager.getPlayerByCardId(conditionData.cardChosenId).name
    this.passiveEffectToAdd.condition.conditionData = data;
    PassiveManager.registerOneTurnPassiveEffect(this.passiveEffectToAdd, true)
    // let cardPlayer = PlayerManager.getPlayerByCard(targetItem);
    //cardPlayer.rechargeItem(targetItem);
    cc.log(`registered one turn passive ${this.passiveEffectToAdd.name}`)
    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
