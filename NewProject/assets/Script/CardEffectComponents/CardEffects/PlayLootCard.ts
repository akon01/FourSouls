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
export default class PlayLootCard extends Effect {
  chooseType = CHOOSE_TYPE.PLAYERHAND;

  effectName = "playLootCard";

  @property(DataCollector)
  dataCollector = null;

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  @printMethodStarted(COLORS.BLUE)
  async doEffect(data?: { cardPlayedId: number; playerId: number }) {
    let cardPlayed = CardManager.getCardById(data.cardPlayedId);
    let player = PlayerManager.getPlayerById(data.playerId);
    player.getComponent(Player).playLootCard(cardPlayed, true);
    return new Promise((resolve, reject) => {
      resolve(data);
    });
  }
}
