import { printMethodStarted } from "../../Constants";

import CardManager from "../../Managers/CardManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE, COLORS } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Deck from "../../Entites/GameEntities/Deck";
import CardPreviewManager from "../../Managers/CardPreviewManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LookAtTopDeck extends Effect {
  chooseType = CHOOSE_TYPE.DECKS;

  effectName = "LookAtTopDeck";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  @property(Number)
  numOfCards: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */

  //@printMethodStarted(COLORS.RED)
  doEffect(
    serverEffectStack: ServerEffect[],
    data?: { cardChosenId: number; playerId: number }
  ) {


    let deck: Deck = CardManager.getCardById(data.cardChosenId).getComponent(
      Deck
    );
    let cardsToSee = [];
    for (let i = 0; i < this.numOfCards; i++) {
      if (deck._cards.length > i) {
        cardsToSee.push(deck._cards[i]);
        //now only log, do multiple card previews!

      }
    }
    CardPreviewManager.getPreviews(cardsToSee)

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
