import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE, TARGETTYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import { override } from "kaop";
import { ActiveEffectData } from "../../Managers/NewScript";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StealMoney extends Effect {
  chooseType = CHOOSE_TYPE.PLAYERS;

  effectName = "stealMoney";

  @property(Number)
  numOfCoins: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: ActiveEffectData
  ) {
    let stealer = data.effectCardPlayer.getComponent(Player)
      ;
    let targetPlayer = PlayerManager.getPlayerByCard(data.getTarget(TARGETTYPE.PLAYER))

    if (targetPlayer.coins >= this.numOfCoins) {
      await targetPlayer.changeMoney(-this.numOfCoins, false);
      await stealer.changeMoney(this.numOfCoins, false);
    } else {
      await stealer.changeMoney(targetPlayer.coins, false);
      await targetPlayer.changeMoney(-targetPlayer.coins, false);
    }

    return serverEffectStack;
  }
}
