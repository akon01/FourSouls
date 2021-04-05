import { Component, Event, Layout, Node, _decorator } from 'cc';
import { Signal } from "../../../Misc/Signal";
import { CARD_TYPE } from "../../Constants";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { RefillEmptySlot } from "../../StackEffects/RefillEmptySlot";
import { Card } from "./Card";
import { Deck } from "./Deck";
const { ccclass, property } = _decorator;


@ccclass('Store')
export class Store extends Component {
      maxNumOfItems: number = 2;

      storeCards: Set<number> = new Set()

      thisTurnStoreCards: Node[] = []

      storeCardsCost: number = 10;

      topCardCost: number = 10;










      getStoreCards() {
            return Array.from(this.storeCards.values()).map(cid => WrapperProvider.cardManagerWrapper.out.getCardById(cid))
      }

      @property
      layout: Layout | null = null;

      async addMaxNumOfItems(maxNumToSet: number, sendToServer: boolean) {
            const currentMax = WrapperProvider.storeWrapper.out.maxNumOfItems
            WrapperProvider.storeWrapper.out.maxNumOfItems = maxNumToSet;
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.SET_MAX_ITEMS_STORE, { number: maxNumToSet })
                  for (let i = 0; i < maxNumToSet - currentMax; i++) {
                        const refillStoreSE = new RefillEmptySlot(WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!.character!.getComponent(Card)!._cardId, null, CARD_TYPE.TREASURE)
                        await WrapperProvider.stackWrapper.out.addToStackAbove(refillStoreSE)

                  }
            }
      }

      addStoreCard(sendToServer: boolean, cardToAdd?: Node) {
            if (WrapperProvider.storeWrapper.out.maxNumOfItems > WrapperProvider.storeWrapper.out.storeCards.size) {
                  let newTreasure: Node
                  if (cardToAdd != null) {
                        newTreasure = cardToAdd
                  } else {
                        newTreasure = WrapperProvider.cardManagerWrapper.out.treasureDeck!.getComponent(Deck)!.drawCard(sendToServer);
                  }
                  const treasureCardComp = newTreasure.getComponent(Card)!;
                  if (treasureCardComp._isShowingBack) {
                        treasureCardComp.flipCard(sendToServer);
                  }
                  WrapperProvider.cardManagerWrapper.out.allCards.push(newTreasure);
                  WrapperProvider.cardManagerWrapper.out.addOnTableCards([newTreasure]);
                  WrapperProvider.storeWrapper.out.storeCards.add(treasureCardComp._cardId);
                  WrapperProvider.storeWrapper.out.thisTurnStoreCards.push(newTreasure)
                  newTreasure.setPosition(0, 0)
                  newTreasure.setParent(this.node)
                  //this.node.addChild(newTreasure);
                  this.layout!.updateLayout();
                  const cardId = treasureCardComp._cardId
                  if (sendToServer) {
                        WrapperProvider.serverClientWrapper.out.send(Signal.ADD_STORE_CARD, { cardId: cardId })
                  }
            } else { WrapperProvider.loggerWrapper.out.error(`already max store cards`) }
      }


      async discardStoreCard(card: Node, sendToServer: boolean) {
            if (!this.storeCards.has(card.getComponent(Card)!._cardId)) {
                  throw new Error(`Can't Discard ${card.name} from store, it is not there!`);

            }
            await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.TREASURE, card, sendToServer)
            await this.removeFromStore(card, sendToServer)
      }

      async removeFromStore(storeItem: Node, sendToserver: boolean) {
            const storeCards = WrapperProvider.storeWrapper.out.getStoreCards();
            if (
                  ((storeCards.findIndex(card => card == storeItem, this) != -1))
            ) {
                  const itemCardComp = storeItem.getComponent(Card)!;
                  WrapperProvider.storeWrapper.out.storeCards.delete(itemCardComp._cardId)
                  if (sendToserver) {
                        WrapperProvider.serverClientWrapper.out.send(Signal.REMOVE_ITEM_FROM_SHOP, { cardId: itemCardComp._cardId })
                        const refillStoreSE = new RefillEmptySlot(WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!.character!.getComponent(Card)!._cardId, null, CARD_TYPE.TREASURE)
                        await WrapperProvider.stackWrapper.out.addToStackAbove(refillStoreSE)
                  }
                  // this.addStoreCard(sendToserver);
            } else if (storeItem == WrapperProvider.cardManagerWrapper.out.treasureDeck) {
            } else {
                  //throw new Error(`${storeItem.name} was not in the store cards ${WrapperProvider.storeWrapper.out.storeCards.map(card => card.name)}`)
            }
      }

      // LIFE-CYCLE CALLBACKS:

      onLoad() {
            this.layout = this.node.getComponent(Layout);
            this.node.dispatchEvent(new Event("StoreInit", true));
            WrapperProvider.storeWrapper.out.storeCards = new Set();
      }

}
