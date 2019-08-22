import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import { override } from "kaop";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StealMoney extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;

  effectName = "stealMoney";

  @property(Number)
  numOfCoins: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {
    let stealer = data.effectCardPlayer.getComponent(Player)
    let playerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (playerCard instanceof cc.Node) {
      let targetPlayer = PlayerManager.getPlayerByCard(playerCard)
      if (targetPlayer == null) {
        cc.log(`no target player available`)
      } else {
        if (targetPlayer.coins >= this.numOfCoins) {
          await targetPlayer.changeMoney(-this.numOfCoins, false);
          await stealer.changeMoney(this.numOfCoins, false);
        } else {
          await stealer.changeMoney(targetPlayer.coins, false);
          await targetPlayer.changeMoney(-targetPlayer.coins, false);
        }
      }
    }

    return stack;
  }
}
