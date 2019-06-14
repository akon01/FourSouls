import { ServerEffect } from "./../../Entites/ServerCardEffect";
import { CHOOSE_TYPE } from "./../../Constants";

import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import { printMethodStarted, COLORS } from "../../Constants";
import EffectInterface from "./EffectInterface";
import Effect from "./Effect";
import DataCollector from "../DataCollector/DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayLootCard extends Effect {
  chooseType = CHOOSE_TYPE.PLAYERHAND;

  effectName = "playLootCard";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: { serverEffect: ServerEffect; playerId: number }
  ) {
    // let cardPlayed = CardManager.getCardById(data.cardPlayedId);
    // let player = PlayerManager.getPlayerById(data.playerId);
    // player.getComponent(Player).playLootCard(cardPlayed, true);
    serverEffectStack.push(data.serverEffect);
    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
