import { CARD_TYPE, CARD_WIDTH, CARD_HEIGHT } from "../../Constants";
import CardManager from "../../Managers/CardManager";
import DataCollector from "../../CardEffectComponents/DataCollector/DataCollector";
import Server from "../../../ServerClient/ServerClient";
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


  @property([cc.Prefab])
  cardsPrefab: cc.Prefab[] = [];

  @property
  _cardId: number = 0;

  @property
  _isRequired: boolean = false;

  @property
  _requiredFor: DataCollector = null;


  addToDeckOnTop(card: cc.Node, sendToServer: boolean) {
    this._cards.push(card);
    CardManager.inDecksCards.push(card);
    //CardManager.monsterCardPool.put(card);
    card.setParent(null)
    let serverData = {
      signal: Signal.DECKADDTOTOP,
      srvData: { deckType: this.deckType, cardId: card.getComponent(Card)._cardId }
    };
    if (sendToServer) {
      Server.$.send(serverData.signal, serverData.srvData)
    }
  }
  drawCard(sendToServer: boolean): cc.Node {

    if (this._cards.length != 0) {
      let newCard = this._cards.pop();

      if (newCard.parent == null) {
        newCard.parent = cc.find('Canvas')
        newCard.setPosition(this.node.getPosition())
      }
      CardManager.removeFromInAllDecksCards(newCard);
      if (sendToServer) {
        Server.$.send(Signal.DRAWCARD, { deckType: this.deckType })
      }
      return newCard;
    } else {
      return null;
    }

  }

  addToDeckOnBottom(card: cc.Node, sendToServer: boolean) {
    this._cards.unshift(card);
    CardManager.inDecksCards.push(card);
    card.setParent(null)
    let serverData = {
      signal: Signal.DECKADDTOBOTTOM,
      srvData: { deckType: this.deckType, cardId: card.getComponent(Card)._cardId }
    };
    if (sendToServer) {
      Server.$.send(serverData.signal, serverData.srvData)
    }
  }

  shuffleDeck() {
    let newDeckArrangment: cc.Node[];
    for (let i = 0; i < this._cards.length; i++) {
      newDeckArrangment.push(
        this._cards[Math.floor(Math.random() * this._cards.length)]
      );
    }
    this._cards = newDeckArrangment;
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

  // update (dt) {}
}
