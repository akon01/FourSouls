import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardPlayer from "../DataCollector/CardPlayer";
import CardManager from "../../Managers/CardManager";

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

    let card = CardManager.getCardById(data.target)

    // let targetPlayer
    // if (card.name == 'Samson') {
    //   targetPlayer = PlayerManager.getPlayerByCardId(data.target)
    //   let player: Player = targetPlayer.getComponent(Player);
    //   player.setMoney(player.coins + 1, false)
    // } else {
    // if (this.dataCollector instanceof CardPlayer) {

    //   targetPlayer = PlayerManager.getPlayerByCardId(data.target);
    // } else
    let targetPlayer = PlayerManager.getPlayerById(data.target);

    let player: Player = targetPlayer.getComponent(Player);
    player.changeMoney(this.numOfCoins, true);

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
