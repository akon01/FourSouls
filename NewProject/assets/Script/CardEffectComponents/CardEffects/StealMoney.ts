import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import { override } from "kaop";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Stack from "../../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StealMoney extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;

  effectName = "stealMoney";

  @property(cc.Integer)
  numOfCoins: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {

    let stealer = PlayerManager.getPlayerByCard(data.effectCardPlayer)
    let playerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (playerCard instanceof cc.Node) {
      let targetPlayer = PlayerManager.getPlayerByCard(playerCard)
      if (targetPlayer == null) {
        throw new Error(`no target player available`)
      } else {
        if (targetPlayer.coins >= this.numOfCoins) {
          await targetPlayer.changeMoney(-this.numOfCoins, true);
          await stealer.changeMoney(this.numOfCoins, true);
        } else {
          await stealer.changeMoney(targetPlayer.coins, true);
          await targetPlayer.changeMoney(-targetPlayer.coins, true);
        }
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
