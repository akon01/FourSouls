import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardPlayer from "../DataCollector/CardPlayer";
import CardManager from "../../Managers/CardManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GainLoot extends Effect {
  effectName = "GainLoot";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  @property(Number)
  numOfLoot: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(serverEffectStack: ServerEffect[], data?) {

    // let card = CardManager.getCardById(data.cardPlayerId)

    // let targetPlayer
    // if (card.name == 'Samson') {
    //   targetPlayer = PlayerManager.getPlayerByCardId(data.target)
    //   let player: Player = targetPlayer.getComponent(Player);
    //   player.setMoney(player.coins + 1, false)
    // } else {
    // if (this.dataCollector instanceof CardPlayer) {

    //   targetPlayer = PlayerManager.getPlayerByCardId(data.target);
    // } else
    cc.log(data)
    let targetPlayer = PlayerManager.getPlayerById(data.target);

    let player: Player = targetPlayer.getComponent(Player);
    for (let i = 0; i < this.numOfLoot; i++) {

      await player.drawCard(CardManager.lootDeck, true)
    }

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
