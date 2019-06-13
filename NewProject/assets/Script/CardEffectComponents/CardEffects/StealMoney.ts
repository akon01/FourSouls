import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import { override } from "kaop";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StealMoney extends Effect {
  chooseType = CHOOSE_TYPE.PLAYER;

  effectName = "stealMoney";

  @property({
    type: DataCollector,
    override: true
  })
  dataCollector: DataCollector = null;

  @property(Number)
  numOfCoins: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */

  doEffect(
    serverEffectStack: ServerEffect[],
    data?: { cardChosenId: number; playerId: number }
  ) {
    let stealer = PlayerManager.getPlayerById(data.playerId).getComponent(
      Player
    );
    cc.log(data);
    let targetPlayer = PlayerManager.getPlayerByCardId(
      data.cardChosenId
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
