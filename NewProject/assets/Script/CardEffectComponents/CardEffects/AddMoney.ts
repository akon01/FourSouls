import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardPlayer from "../DataCollector/CardPlayer";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData } from "../../Managers/NewScript";
import { TARGETTYPE } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddMoney extends Effect {
  effectName = "addMoney";

  @property(Number)
  numOfCoins: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(serverEffectStack: ServerEffect[], data?: ActiveEffectData) {


    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)

    let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard)
    await player.changeMoney(this.numOfCoins, true);

    return serverEffectStack
  }
}
