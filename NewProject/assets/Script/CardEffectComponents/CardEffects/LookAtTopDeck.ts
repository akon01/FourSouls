import { printMethodStarted } from "../../Constants";

import CardManager from "../../Managers/CardManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE, COLORS } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Deck from "../../Entites/GameEntities/Deck";

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
    // let originalPlayer = PlayerManager.getPlayerById(
    //   data.playerId
    // ).getComponent(Player);

    let deck: Deck = CardManager.getCardById(data.cardChosenId).getComponent(
      Deck
    );

    for (let i = 0; i < this.numOfCards; i++) {
      if (deck._cards.length > i) {
        const card = deck._cards[i];
        //now only log, do multiple card previews!

      }
    }

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
