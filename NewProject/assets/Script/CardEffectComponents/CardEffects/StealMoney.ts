import { ServerEffect } from "./../../Entites/ServerCardEffect";
import { COLORS, CHOOSE_TYPE } from "./../../Constants";

import Player from "../../Entites/Player";

import PlayerManager from "../../Managers/PlayerManager";
import { printMethodStarted } from "../../Constants";
import Card from "../../Entites/Card";
import EffectInterface from "./EffectInterface";
import Effect from "./Effect";
import DataCollector from "../DataCollector/DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StealMoney extends Effect {
  chooseType = CHOOSE_TYPE.PLAYER;

  effectName = "stealMoney";

  @property(DataCollector)
  dataCollector = null;

  @property(Number)
  numOfCoins: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */

  doEffect(
    serverEffectStack: ServerEffect[],
    data?: { cardChosen: number; playerId: number }
  ) {
    let stealer = PlayerManager.getPlayerById(data.playerId).getComponent(
      Player
    );

    let targetPlayer = PlayerManager.getPlayerByCardId(
      data.cardChosen
    ).getComponent(Player);

    if (targetPlayer.coins >= this.numOfCoins) {
      targetPlayer.changeMoney(-this.numOfCoins);
      stealer.changeMoney(this.numOfCoins);
    } else {
      stealer.changeMoney(targetPlayer.coins);
      targetPlayer.changeMoney(-targetPlayer.coins);
    }

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
