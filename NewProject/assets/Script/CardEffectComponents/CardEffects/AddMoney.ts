import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddMoney extends Effect {
  effectName = "addMoney";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  @property(Number)
  numOfCoins: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(serverEffectStack: ServerEffect[], data?: { target: number }) {
    let targetPlayer = PlayerManager.getPlayerById(data.target);
    let player: Player = targetPlayer.getComponent(Player);
    player.changeMoney(this.numOfCoins);

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
