import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardPlayer from "../DataCollector/CardPlayer";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData } from "../../Managers/NewScript";
import Deck from "../../Entites/GameEntities/Deck";
import { TARGETTYPE } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GainTreasure extends Effect {
  effectName = "GainTreasure";


  @property(Number)
  numOfTreasure: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(serverEffectStack: ServerEffect[], data?: ActiveEffectData) {



    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);

    let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard)
    let topDeck = CardManager.treasureDeck.getComponent(Deck).topBlankCard
    for (let i = 0; i < this.numOfTreasure; i++) {
      await player.addItem(topDeck, true, true)
    }

    return serverEffectStack
  }
}
