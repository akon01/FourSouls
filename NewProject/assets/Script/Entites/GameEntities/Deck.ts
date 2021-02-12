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
  private _cards: number[] = []

  getCardsLength() {
    return this._cards.length
  }

  removeCard(card: cc.Node | number) {
    if (card instanceof cc.Node) {
      const cardId = card.getComponent(Card)._cardId;
      if (this._cards.includes(cardId))
        return this._cards.splice(this._cards.indexOf(cardId), 1)
    } else {
      if (this._cards.includes(card))
        return this._cards.splice(this._cards.indexOf(card, 1))
    }
  }

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

  addToDeckOnTop(card: cc.Node, offset: number, sendToServer: boolean) {

    const cardComp = card.getComponent(Card);
    if (this._cards.includes(cardComp._cardId)) {
      this._cards.splice(this._cards.indexOf(cardComp._cardId), 1)
    } else {
      CardManager.inDecksCardsIds.push(cardComp._cardId);
    }
    const index = (this._cards.length != 0) ? this._cards.length - 1 : 0
    var newOffset = offset != 0 ? offset - 1 : offset
    this._cards.splice(index - newOffset, 0, cardComp._cardId);
    // CardManager.monsterCardPool.put(card);
    card.setParent(null)
    const serverData = {
      signal: Signal.DECK_ADD_TO_TOP,
      srvData: { deckType: this.deckType, cardId: cardComp._cardId },
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
  }
  drawCard(sendToServer: boolean): cc.Node {
    if (this._cards.length != 0) {
      const newCardId = this._cards.pop();
      const newCard = CardManager.getCardById(newCardId)
      const newCardComp = newCard.getComponent(Card);
      if (!newCardComp._isFlipped) { newCardComp.flipCard(false) }
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
      return this.drawCard(sendToServer)
    }
  }

  resuffleDeck() {

    this._cards = this.pile.getCards().map(card => card.getComponent(Card)._cardId)
    this.shuffleDeck()
  }

  async discardTopCard() {
    const topCard = CardManager.getCardById(this._cards.pop())
    this.drawSpecificCard(topCard, true)
    await PileManager.addCardToPile(this.deckType, topCard, true)
  }



  drawSpecificCard(cardToDraw: cc.Node, sendToServer: boolean): cc.Node {
    if (this._cards.length != 0) {
      const cardComp = cardToDraw.getComponent(Card);
      const newCard = CardManager.getCardById(this._cards.splice(this._cards.indexOf(cardComp._cardId), 1)[0]);
      const newCardComp = newCard.getComponent(Card)
      if (!newCardComp._isFlipped) { newCardComp.flipCard(false) }
      if (newCard.parent == null) {
        newCard.parent = CardManager.$.onTableCardsHolder
        newCard.setPosition(this.node.getPosition())
      }
      CardManager.removeFromInAllDecksCards(newCard);
      if (sendToServer) {
        ServerClient.$.send(Signal.DECK_ARRAGMENT, { deckType: this.deckType, arrangement: this._cards })
      }
      return newCard;
    } else {
      return null;
    }
  }

  hasCard(card: cc.Node | number) {
    if (card instanceof cc.Node) {
      return this._cards.includes(card.getComponent(Card)._cardId)
    } else {
      return this._cards.includes(card)
    }
  }

  addToDeckOnBottom(card: cc.Node, offset: number, sendToServer: boolean) {
    const cardComp = card.getComponent(Card);
    if (this.hasCard(card)) {
      this._cards.splice(this._cards.indexOf(cardComp._cardId), 1)
    } else {
      CardManager.inDecksCardsIds.push(cardComp._cardId);
    }
    var newOffset = offset != 0 ? offset - 1 : offset
    this._cards.splice(0 + newOffset, 0, cardComp._cardId);
    card.setParent(null)
    const serverData = {
      signal: Signal.DECK_ADD_TO_BOTTOM,
      srvData: { deckType: this.deckType, cardId: cardComp._cardId, offset },
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
  }

  getCards() {
    return this._cards.map(cid => CardManager.getCardById(cid))
  }

  shuffle() {
    const array = this._cards
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
    for (let i = 0; i < randomTimes; i++) {
      this._cards = this.shuffle()
    }

    ServerClient.$.send(Signal.DECK_ARRAGMENT, { deckType: this.deckType, arrangement: this._cards })

  }

  setDeckCards(cards: number[] | cc.Node[]) {
    if (cards[0] instanceof cc.Node) {
      this._cards = (cards as cc.Node[]).map(card => card.getComponent(Card)._cardId)
    } else {
      this._cards = cards as number[]
    }
  }

  createNewTopBlank() { }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {

    this.node.width = CARD_WIDTH;
    this.node.height = CARD_HEIGHT;
    this._cards = []
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
