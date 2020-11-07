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
import PileManager from "../../Managers/PileManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Store extends cc.Component {
  static maxNumOfItems: number = 2;

  static storeCards: Set<number> = null

  static thisTurnStoreCards: cc.Node[] = []

  static storeCardsCost: number = 10;

  static topCardCost: number = 10;

  static $: Store = null;

  static getStoreCards() {
    return Array.from(this.storeCards.values()).map(cid => CardManager.getCardById(cid))
  }

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
    if (Store.maxNumOfItems > Store.storeCards.size) {
      let newTreasure: cc.Node
      if (cardToAdd != null) {
        newTreasure = cardToAdd
      } else {
        newTreasure = CardManager.treasureDeck.getComponent(Deck).drawCard(sendToServer);
      }
      const treasureCardComp = newTreasure.getComponent(Card);
      if (treasureCardComp._isFlipped) {
        treasureCardComp.flipCard(sendToServer);
      }
      CardManager.allCards.push(newTreasure);
      CardManager.addOnTableCards([newTreasure]);
      Store.storeCards.add(treasureCardComp._cardId);
      Store.thisTurnStoreCards.push(newTreasure)
      newTreasure.setPosition(0, 0)
      newTreasure.setParent(this.node)
      //this.node.addChild(newTreasure);
      this.layout.updateLayout();
      const cardId = treasureCardComp._cardId
      if (sendToServer) {
        ServerClient.$.send(Signal.ADD_STORE_CARD, { cardId: cardId })
      }
    } else { Logger.error(`already max store cards`) }
  }


  async discardStoreCard(card: cc.Node, sendToServer: boolean) {
    await PileManager.addCardToPile(CARD_TYPE.TREASURE, card, sendToServer)
    await this.removeFromStore(card, sendToServer)
  }

  async removeFromStore(storeItem: cc.Node, sendToserver: boolean) {
    const storeCards = Store.getStoreCards();
    if (
      ((storeCards.findIndex(card => card == storeItem, this) != -1))
    ) {
      const itemCardComp = storeItem.getComponent(Card);
      Store.storeCards.delete(itemCardComp._cardId)
      if (sendToserver) {
        ServerClient.$.send(Signal.REMOVE_ITEM_FROM_SHOP, { cardId: itemCardComp._cardId })
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
    Store.storeCards = new Set();
  }

  start() { }

  update(dt) { }
}
