import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import DataCollector from "../../CardEffectComponents/DataCollector/DataCollector";
import { CARD_HEIGHT, CARD_TYPE, CARD_WIDTH } from "../../Constants";
import CardManager from "../../Managers/CardManager";
import { CardSet } from "../Card Set";
import Card from "./Card";
import PileManager from "../../Managers/PileManager";
import Pile from "../Pile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Deck extends cc.Component {
  @property({
    type: cc.Enum(CARD_TYPE),
  })
  deckType: CARD_TYPE = CARD_TYPE.LOOT;

  @property({ visible: false })
  pile: Pile = null

  // @property(cc.Node)
  // topBlankCard: cc.Node = null;

  @property
  _cards: CardSet = null

  @property
  suffleInTheStart: boolean = false;

  @property([cc.Prefab])
  cardsPrefab: cc.Prefab[] = [];

  @property
  _cardId: number = 0;

  @property
  _isRequired: boolean = false;

  @property
  _requiredFor: DataCollector = null;

  @property
  _hasEventsBeenModified: boolean = false;

  addToDeckOnTop(card: cc.Node, sendToServer: boolean) {

    if (this._cards.includes(card)) {
      this._cards.splice(this._cards.indexOf(card), 1)
    } else {
      CardManager.inDecksCards.push(card);
    }
    this._cards.push(card);
    // CardManager.monsterCardPool.put(card);
    card.setParent(null)
    const serverData = {
      signal: Signal.DECK_ADD_TO_TOP,
      srvData: { deckType: this.deckType, cardId: card.getComponent(Card)._cardId },
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
  }
  drawCard(sendToServer: boolean): cc.Node {
    if (this._cards.length != 0) {
      const newCard = this._cards.pop();

      if (!newCard.getComponent(Card)._isFlipped) { newCard.getComponent(Card).flipCard(false) }
      if (newCard.parent == null) {
        newCard.parent = CardManager.$.onTableCardsHolder
        newCard.setPosition(this.node.getPosition())
      }
      CardManager.removeFromInAllDecksCards(newCard);
      if (sendToServer) {
        ServerClient.$.send(Signal.DRAW_CARD, { deckType: this.deckType })
      }
      return newCard;
    } else {
      this.resuffleDeck();
      return null;
    }
  }

  resuffleDeck() {

    this._cards.set(this.pile.getCards())
    this.shuffleDeck()
  }

  async discardTopCard() {
    const topCard = this._cards.getCard(this._cards.length - 1)
    this.drawSpecificCard(topCard, true)
    await PileManager.addCardToPile(this.deckType, topCard, true)

  }

  drawSpecificCard(cardToDraw: cc.Node, sendToServer: boolean): cc.Node {
    if (this._cards.length != 0) {
      const newCard = this._cards.splice(this._cards.indexOf(cardToDraw), 1);
      if (!newCard[0].getComponent(Card)._isFlipped) { newCard[0].getComponent(Card).flipCard(false) }
      if (newCard[0].parent == null) {
        newCard[0].parent = CardManager.$.onTableCardsHolder
        newCard[0].setPosition(this.node.getPosition())
      }
      CardManager.removeFromInAllDecksCards(newCard[0]);
      if (sendToServer) {
        ServerClient.$.send(Signal.DECK_ARRAGMENT, { deckType: this.deckType, arrangement: this._cards.map(card => card.getComponent(Card)._cardId) })
      }
      return newCard[0];
    } else {
      return null;
    }

  }

  addToDeckOnBottom(card: cc.Node, sendToServer: boolean) {
    if (this._cards.includes(card)) {
      this._cards.splice(this._cards.indexOf(card), 1)
    } else {
      CardManager.inDecksCards.push(card);
    }
    this._cards.unshift(card);
    card.setParent(null)
    const serverData = {
      signal: Signal.DECK_ADD_TO_BOTTOM,
      srvData: { deckType: this.deckType, cardId: card.getComponent(Card)._cardId },
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
  }

  shuffle(cardSet: CardSet) {
    const array = cardSet.getCards()
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  shuffleDeck() {
    const randomSeed = Math.floor(Math.log(new Date().getTime()))
    const randomTimes = Math.random() * randomSeed
    const currentArrangment = this._cards.getCards()
    for (let i = 0; i < randomTimes; i++) {
      this._cards.set(this.shuffle(this._cards))
    }

    ServerClient.$.send(Signal.DECK_ARRAGMENT, { deckType: this.deckType, arrangement: this._cards.map(card => card.getComponent(Card)._cardId) })

  }

  setDeckCards(cards: CardSet) {
    this._cards = cards
  }

  createNewTopBlank() { }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {

    this.node.width = CARD_WIDTH;
    this.node.height = CARD_HEIGHT;
    this._cards = new CardSet()
    // const sprite = this.topBlankCard.getComponent(cc.Sprite);
    // if (this.topBlankCard.getComponent(Card)._isFlipped) { this.topBlankCard.getComponent(Card).flipCard(false) }
    // sprite.enabled = false;

  }

  start() { }

  // update(dt) {
  //   //   if (this.deckType == CARD_TYPE.MONSTER)
  //   //     cc.log(this._cards.map(card => card.name))
  // }
}
