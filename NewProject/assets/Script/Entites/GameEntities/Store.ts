import Card from "./Card";
import { CardLayout } from "../CardLayout";
import CardManager from "../../Managers/CardManager";
import Deck from "./Deck";
import ServerClient from "../../../ServerClient/ServerClient";
import Signal from "../../../Misc/Signal";
import Item from "../CardTypes/Item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Store extends cc.Component {
  static maxNumOfItems: number = 2;

  static storeCards: cc.Node[] = [];

  static storeCardsCost: number = 10;

  static topCardCost: number = 10;

  static $: Store = null;

  @property
  layout: cc.Layout = null;


  addStoreCard(sendToServer: boolean, cardToAdd?: cc.Node) {
    if (Store.maxNumOfItems > Store.storeCards.length) {
      let newTreasure: cc.Node
      if (cardToAdd != null) {
        newTreasure = cardToAdd
      } else {

        newTreasure = CardManager.treasureDeck.getComponent(Deck).drawCard(sendToServer);
      }
      if (newTreasure.getComponent(Card)._isFlipped) {
        newTreasure.getComponent(Card).flipCard(sendToServer);
      }
      CardManager.allCards.push(newTreasure);
      CardManager.onTableCards.push(newTreasure);
      Store.storeCards.push(newTreasure);
      newTreasure.parent = this.node
      newTreasure.setPosition(0, 0)
      cc.log(this.layout.node.children)
      this.layout.updateLayout();
      cc.log(this.layout.node.children)
      //this.node.addChild(newTreasure);
      let cardId = newTreasure.getComponent(Card)._cardId

      if (sendToServer) {
        ServerClient.$.send(Signal.ADD_STORE_CARD, { cardId: cardId })
      }
    } else cc.error(`already max store cards`)
  }

  buyItemFromShop(itemToBuy: cc.Node, sendToServer: boolean) {
    if (itemToBuy.getComponent(Card).topDeckof == null) {
      cc.log(`buy item ${itemToBuy.name} from the shop`)
      Store.storeCards.splice(Store.storeCards.indexOf(itemToBuy), 1)
      if (sendToServer) {
        ServerClient.$.send(Signal.BUY_ITEM_FROM_SHOP, { cardId: itemToBuy.getComponent(Card)._cardId })
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
