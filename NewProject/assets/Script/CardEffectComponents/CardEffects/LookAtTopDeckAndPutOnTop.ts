import { CARD_TYPE } from "../../Constants";

import CardManager from "../../Managers/CardManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE, COLORS } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Deck from "../../Entites/GameEntities/Deck";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import PileManager from "../../Managers/PileManager";
import { ActiveEffectData } from "../../Managers/NewScript";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LookAtTopDeckAndPutOnTop extends Effect {
  chooseType = CHOOSE_TYPE.DECKS;

  effectName = "LookAtTopDeckAndPutOnTop";



  @property(Number)
  numOfCardsToSee: number = 0;

  @property(Number)
  numOfCardsToPut: number = 0;

  @property
  reorderCards: boolean = false;

  @property({ type: cc.Enum(CARD_TYPE) })
  deckType: CARD_TYPE = CARD_TYPE.CHAR;
  /**
   *
   * @param data {target:PlayerId}
   */

  //@printMethodStarted(COLORS.RED)
  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: ActiveEffectData
  ) {
    let deck: Deck;
    switch (this.deckType) {
      case CARD_TYPE.LOOT:
        deck = CardManager.lootDeck.getComponent(Deck)
        break;
      case CARD_TYPE.MONSTER:
        deck = CardManager.monsterDeck.getComponent(Deck)
        break;
      case CARD_TYPE.TREASURE:
        deck = CardManager.treasureDeck.getComponent(Deck)
      default:
        break;
    }
    let cardsToSee = [];
    for (let i = 0; i < this.numOfCardsToSee; i++) {
      if (deck._cards.length > i) {
        cardsToSee.push(deck._cards[i]);
      }
    }
    let selectedQueue = await CardPreviewManager.selectFromCards(cardsToSee, this.numOfCardsToPut)
    for (let i = 0; i < selectedQueue.length; i++) {
      const selectedCard = selectedQueue[i];
      deck.addToDeckOnTop(selectedCard, true)
    }
    let notSelectedCards: cc.Node[] = [];
    notSelectedCards = cardsToSee.filter(card => !selectedQueue.includes(card))
    for (let i = 0; i < notSelectedCards.length; i++) {
      const card = notSelectedCards[i];
      deck.addToDeckOnBottom(card, true)
      // await PileManager.addCardToPile(this.deckType, card, true)
    }

    return serverEffectStack
  }
}
