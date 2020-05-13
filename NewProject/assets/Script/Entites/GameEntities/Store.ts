import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import { CARD_TYPE } from "../../Constants";
import CardManager from "../../Managers/CardManager";
import TurnsManager from "../../Managers/TurnsManager";
import RefillEmptySlot from "../../StackEffects/Refill Empty Slot";
import { CardLayout } from "../CardLayout";
import Item from "../CardTypes/Item";
import Stack from "../Stack";
import Card from "./Card";
import Deck from "./Deck";
import { Logger } from "../Logger";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Store extends cc.Component {
  static maxNumOfItems: number = 2;

  static storeCards: cc.Node[] = [];

  static thisTurnStoreCards: cc.Node[] = []

  static storeCardsCost: number = 10;

  static topCardCost: number = 10;

  static $: Store = null;

  @property
  layout: cc.Layout = null;

  static async addMaxNumOfItems(maxNumToSet: number, sendToServer: boolean) {
    const currentMax = Store.maxNumOfItems
    Store.maxNumOfItems = maxNumToSet;
    if (sendToServer) {
      ServerClient.$.send(Signal.SET_MAX_ITEMS_STORE, { number: maxNumToSet })
      for (let i = 0; i < maxNumToSet - currentMax; i++) {
        const refillStoreSE = new RefillEmptySlot(TurnsManager.currentTurn.getTurnPlayer().character.getComponent(Card)._cardId, null, CARD_TYPE.TREASURE)
        await Stack.addToStackAbove(refillStoreSE)

      }
    }
  }

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
      Store.thisTurnStoreCards.push(newTreasure)
      newTreasure.setPosition(0, 0)
      newTreasure.setParent(this.node)
      //this.node.addChild(newTreasure);
      this.layout.updateLayout();
      const cardId = newTreasure.getComponent(Card)._cardId
      if (sendToServer) {
        ServerClient.$.send(Signal.ADD_STORE_CARD, { cardId: cardId })
      }
    } else { Logger.error(`already max store cards`) }
  }



  async removeFromStore(storeItem: cc.Node, sendToserver: boolean) {
    if (
      ((Store.storeCards.findIndex(card => card == storeItem, this) != -1))
    ) {
      Store.storeCards.splice(Store.storeCards.indexOf(storeItem), 1);
      if (sendToserver) {
        ServerClient.$.send(Signal.REMOVE_ITEM_FROM_SHOP, { cardId: storeItem.getComponent(Card)._cardId })
        const refillStoreSE = new RefillEmptySlot(TurnsManager.currentTurn.getTurnPlayer().character.getComponent(Card)._cardId, null, CARD_TYPE.TREASURE)
        await Stack.addToStackAbove(refillStoreSE)
      }
      // this.addStoreCard(sendToserver);
    } else if (storeItem == CardManager.treasureDeck) {
    } else {
      //throw new Error(`${storeItem.name} was not in the store cards ${Store.storeCards.map(card => card.name)}`)
    }
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
