import { TARGETTYPE } from "../../Constants";

import CardManager from "../../Managers/CardManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE, COLORS } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Deck from "../../Entites/GameEntities/Deck";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData } from "../../Managers/DataInterpreter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LookAtTopDeck extends Effect {
  chooseType = CHOOSE_TYPE.DECKS;

  effectName = "LookAtTopDeck";

  @property(Number)
  numOfCards: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */

  //@printMethodStarted(COLORS.RED)
  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: ActiveEffectData
  ) {


    let deck: Deck = data.getTarget(TARGETTYPE.DECK).getComponent(
      Deck
    );
    cc.log(deck)
    let cardsToSee: cc.Node[] = [];
    for (let i = 1; i <= this.numOfCards; i++) {
      if (deck._cards.length > i) {
        cardsToSee.push(deck._cards[deck._cards.length - i]);
        //now only log, do multiple card previews!
      }
    }
    cc.log(cardsToSee.map(card => card.name))
    CardPreviewManager.getPreviews(cardsToSee)

    return serverEffectStack
  }
}
