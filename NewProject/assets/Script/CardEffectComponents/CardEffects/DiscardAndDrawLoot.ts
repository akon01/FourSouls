import { ServerEffect } from "./../../Entites/ServerCardEffect";
import { CHOOSE_TYPE } from "./../../Constants";

import Player from "../../Entites/Player";

import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import { printMethodStarted, COLORS } from "../../Constants";
import EffectInterface from "./EffectInterface";
import Effect from "./Effect";
import DataCollector from "../DataCollector/DataCollector";

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
    player.discardLoot(cardChosen);
    player.drawCard(CardManager.lootDeck);
    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
