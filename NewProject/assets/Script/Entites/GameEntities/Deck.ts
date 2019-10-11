import { CARD_TYPE, CARD_WIDTH, CARD_HEIGHT } from "../../Constants";
import CardManager from "../../Managers/CardManager";
import DataCollector from "../../CardEffectComponents/DataCollector/DataCollector";
import ServerClient from "../../../ServerClient/ServerClient";
import Signal from "../../../Misc/Signal";
import Card from "./Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Deck extends cc.Component {
  @property({
    type: cc.Enum(CARD_TYPE)
  })
  deckType: CARD_TYPE = CARD_TYPE.LOOT;

  @property(cc.Node)
  topBlankCard: cc.Node = null;

  @property([cc.Node])
  _cards: cc.Node[] = [];

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
    this._cards.push(card);
    CardManager.inDecksCards.push(card);
    //CardManager.monsterCardPool.put(card);
    card.setParent(null)
    let serverData = {
      signal: Signal.DECK_ADD_TO_TOP,
      srvData: { deckType: this.deckType, cardId: card.getComponent(Card)._cardId }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
  }
  drawCard(sendToServer: boolean): cc.Node {
    if (this._cards.length != 0) {
      let newCard = this._cards.pop();
      cc.log(`${newCard.name} was drawn from its deck`)

      if (!newCard.getComponent(Card)._isFlipped) newCard.getComponent(Card).flipCard(false)
      if (newCard.parent == null) {
        newCard.parent = cc.find('Canvas')
        newCard.setPosition(this.node.getPosition())
      }
      CardManager.removeFromInAllDecksCards(newCard);
      if (sendToServer) {
        ServerClient.$.send(Signal.DRAW_CARD, { deckType: this.deckType })
      }
      return newCard;
    } else {
      return null;
    }
  }

  drawSpecificCard(cardToDraw: cc.Node, sendToServer: boolean): cc.Node {
    if (this._cards.length != 0) {
      let newCard = this._cards.splice(this._cards.indexOf(cardToDraw));
      cc.log(`${newCard[0].name} was drawn from its deck`)

      if (!newCard[0].getComponent(Card)._isFlipped) newCard[0].getComponent(Card).flipCard(false)
      if (newCard[0].parent == null) {
        newCard[0].parent = cc.find('Canvas')
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
    this._cards.unshift(card);
    CardManager.inDecksCards.push(card);
    card.setParent(null)
    let serverData = {
      signal: Signal.DECK_ADD_TO_BOTTOM,
      srvData: { deckType: this.deckType, cardId: card.getComponent(Card)._cardId }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
  }

  shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

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
    let randomSeed = Math.floor(Math.log(new Date().getTime()))
    let randomTimes = Math.random() * randomSeed
    for (let i = 0; i < randomTimes; i++) {
      this._cards = this.shuffle(this._cards)
    }

    ServerClient.$.send(Signal.DECK_ARRAGMENT, { deckType: this.deckType, arrangement: this._cards.map(card => card.getComponent(Card)._cardId) })
  }

  setDeckCards(cards: cc.Node[]) {
    this._cards = cards
  }

  createNewTopBlank() { }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {

    this.node.width = CARD_WIDTH;
    this.node.height = CARD_HEIGHT;

    let sprite = this.topBlankCard.getComponent(cc.Sprite);
    sprite.enabled = false;

  }

  start() { }

  // update(dt) {
  //   //   if (this.deckType == CARD_TYPE.MONSTER)
  //   //     cc.log(this._cards.map(card => card.name))
  // }
}
