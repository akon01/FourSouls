import Card from "./Card";
import { CardLayout } from "../CardLayout";
import CardManager from "../../Managers/CardManager";
import Deck from "./Deck";
import { printMethodStarted, COLORS } from "../../Constants";
import Server from "../../../ServerClient/ServerClient";
import Signal from "../../../Misc/Signal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Store extends cc.Component {
  static maxNumOfItems: number = 2;

  static storeCards: cc.Node[] = [];

  static $: Store = null;

  @property
  layout: cc.Layout = null;

  //@printMethodStarted(COLORS.PURPLE)
  addStoreCard(sendToserver: boolean, cardToAdd?: cc.Node) {
    if (Store.maxNumOfItems > Store.storeCards.length) {
      let newTreasure: cc.Node
      if (cardToAdd != null) {
        newTreasure = cardToAdd
      } else {

        newTreasure = CardManager.treasureDeck.getComponent(Deck).drawCard(sendToserver);
      }
      if (newTreasure.getComponent(Card)._isFlipped) {
        newTreasure.getComponent(Card).flipCard();
      } else {
      }
      CardManager.allCards.push(newTreasure);
      CardManager.onTableCards.push(newTreasure);
      Store.storeCards.push(newTreasure);
      this.node.addChild(newTreasure);
      let cardId = newTreasure.getComponent(Card)._cardId

      if (sendToserver) {
        Server.$.send(Signal.ADDSTORECARD, { cardId: cardId })
      }
    }
  }

  discardStoreCard(storeItem: cc.Node, sendToserver: boolean) {
    let cardIndex;
    if (
      (cardIndex = Store.storeCards.findIndex(card => card == storeItem) != -1)
    ) {
      Store.storeCards.splice(cardIndex, 1);
      this.addStoreCard(sendToserver);
    } else throw "o Store item received wasn't found to discard";
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    Store.$ = this;
    this.layout = this.node.getComponent(cc.Layout);
    this.node.dispatchEvent(new cc.Event.EventCustom("StoreInit", true));
  }

  start() { }

  update(dt) { }
}
