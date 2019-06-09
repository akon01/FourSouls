import { ServerEffect } from "./../../Entites/ServerCardEffect";
import { COLORS, CHOOSE_TYPE } from "./../../Constants";

import Player from "../../Entites/Player";

import PlayerManager from "../../Managers/PlayerManager";
import { printMethodStarted } from "../../Constants";
import Card from "../../Entites/Card";
import EffectInterface from "./EffectInterface";
import Effect from "./Effect";
import DataCollector from "../DataCollector/DataCollector";
import CardManager from "../../Managers/CardManager";
import Deck from "../../Entites/Deck";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LookAtTopDeck extends Effect {
  chooseType = CHOOSE_TYPE.DECKS;

  effectName = "LookAtTopDeck";

  @property(DataCollector)
  dataCollector = null;

  @property(Number)
  numOfCards: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */

  @printMethodStarted(COLORS.RED)
  doEffect(
    serverEffectStack: ServerEffect[],
    data?: { cardChosenId: number; playerId: number }
  ) {
    // let originalPlayer = PlayerManager.getPlayerById(
    //   data.playerId
    // ).getComponent(Player);

    let deck = CardManager.getCardById(data.cardChosenId).getComponent(Deck);

    for (let i = 0; i < this.numOfCards; i++) {
      if (deck.cards.length > i) {
        const card = deck.cards[i];
        //now only log, do multiple card previews!
        cc.log("card in place " + i + 1 + " is " + card.name);
      }
    }

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
