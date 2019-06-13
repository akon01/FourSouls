import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DiscardAndDrawLoot extends Effect {
  chooseType = CHOOSE_TYPE.PLAYERHAND;

  effectName = "DiscardAndDrawLoot";

  @property(DataCollector)
  dataCollector = null;

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: { cardChosenId: number; playerId: number }
  ) {
    let cardChosen = CardManager.getCardById(data.cardChosenId);
    let player = PlayerManager.getPlayerById(data.playerId).getComponent(
      Player
    );
    // player.getComponent(Player).playLootCard(cardPlayed, true);
    player.discardLoot(cardChosen, false);
    player.drawCard(CardManager.lootDeck, false);
    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
