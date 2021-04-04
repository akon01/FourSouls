import { Component, Enum, Node, Prefab, UITransform, _decorator } from 'cc';
import { Signal } from "../../../Misc/Signal";
import { DataCollector } from "../../CardEffectComponents/DataCollector/DataCollector";
import { CARD_HEIGHT, CARD_TYPE, CARD_WIDTH } from "../../Constants";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Pile } from "../Pile";
import { Card } from "./Card";
import { Player } from './Player';
const { ccclass, property } = _decorator;


@ccclass('Deck')
export class Deck extends Component {
      @property({
            type: Enum(CARD_TYPE),
      })
      deckType: CARD_TYPE = CARD_TYPE.LOOT;

      pile: Pile | null = null

      // @property(Node)
      // topBlankCard: Node = null;

      @property
      private _cards: number[] = []




      getCardsLength() {
            return this._cards.length
      }

      removeCard(card: Node | number) {
            if (card instanceof Node) {
                  const cardId = card.getComponent(Card)!._cardId;
                  if (this._cards.indexOf(cardId) >= 0)
                        return this._cards.splice(this._cards.indexOf(cardId), 1)
            } else {
                  if (this._cards.indexOf(card) >= 0)
                        return this._cards.splice(this._cards.indexOf(card, 1))
            }
      }

      @property
      suffleInTheStart: boolean = false;

      @property([Prefab])
      cardsPrefab: Prefab[] = [];

      @property
      _cardId: number = 0;

      @property
      _isRequired: boolean = false;

      @property
      _requiredFor: DataCollector | null = null;

      @property
      _hasEventsBeenModified: boolean = false;

      _isDrawFromPileInsted = false

      addToDeckOnTop(card: Node, offset: number, sendToServer: boolean) {

            const cardComp = card.getComponent(Card)!;
            if (this._cards.indexOf(cardComp._cardId) >= 0) {
                  this._cards.splice(this._cards.indexOf(cardComp._cardId), 1)
            } else {
                  WrapperProvider.cardManagerWrapper.out.inDecksCardsIds.push(cardComp._cardId);
            }
            const index = (this._cards.length != 0) ? this._cards.length - 1 : 0
            var newOffset = offset != 0 ? offset - 1 : offset
            this._cards.splice(index - newOffset, 0, cardComp._cardId);
            // WrapperProvider.cardManagerWrapper.out.monsterCardPool.put(card);
            card.setParent(null)
            const serverData = {
                  signal: Signal.DECK_ADD_TO_TOP,
                  srvData: { deckType: this.deckType, cardId: cardComp._cardId },
            };
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
            }
      }
      drawCard(sendToServer: boolean): Node {
            if (this._isDrawFromPileInsted) {
                  const pileTop = this.pile?.getTopCard()!
                  this.pile?.removeFromPile(pileTop);
                  return pileTop
            }
            if (this._cards.length != 0) {
                  const newCardId = this._cards.pop()!;
                  const newCard = WrapperProvider.cardManagerWrapper.out.getCardById(newCardId)!
                  const newCardComp = newCard.getComponent(Card)!;
                  if (!newCardComp._isFlipped) { newCardComp.flipCard(false) }
                  if (newCard.parent == null) {
                        newCard.parent = WrapperProvider.cardManagerWrapper.out.onTableCardsHolder
                        newCard.setPosition(this.node.getPosition())
                  }
                  WrapperProvider.cardManagerWrapper.out.removeFromInAllDecksCards(newCard);
                  if (sendToServer) {
                        WrapperProvider.serverClientWrapper.out.send(Signal.DRAW_CARD, { deckType: this.deckType })
                  }
                  return newCard;
            } else {
                  this.resuffleDeck();
                  return this.drawCard(sendToServer)
            }
      }

      resuffleDeck() {

            this._cards = this.pile!.getCards().map(card => card.getComponent(Card)!._cardId)
            this.shuffleDeck()
      }

      async discardTopCard() {
            const topCard = WrapperProvider.cardManagerWrapper.out.getCardById(this._cards.pop()!)
            this.drawSpecificCard(topCard, true)
            await WrapperProvider.pileManagerWrapper.out.addCardToPile(this.deckType, topCard, true)
      }



      drawSpecificCard(cardToDraw: Node, sendToServer: boolean): Node | null {
            if (this._cards.length != 0) {
                  const cardComp = cardToDraw.getComponent(Card)!;
                  const newCard = WrapperProvider.cardManagerWrapper.out.getCardById(this._cards.splice(this._cards.indexOf(cardComp._cardId), 1)[0]);
                  const newCardComp = newCard.getComponent(Card)!
                  if (!newCardComp._isFlipped) { newCardComp.flipCard(false) }
                  if (newCard.parent == null) {
                        newCard.parent = WrapperProvider.cardManagerWrapper.out.onTableCardsHolder
                        newCard.setPosition(this.node.getPosition())
                  }
                  WrapperProvider.cardManagerWrapper.out.removeFromInAllDecksCards(newCard);
                  if (sendToServer) {
                        WrapperProvider.serverClientWrapper.out.send(Signal.DECK_ARRAGMENT, { deckType: this.deckType, arrangement: this._cards })
                  }
                  return newCard;
            } else {
                  return null;
            }
      }

      hasCard(card: Node | number) {
            if (card instanceof Node) {
                  return this._cards.indexOf(card.getComponent(Card)!._cardId) >= 0
            } else {
                  return this._cards.indexOf(card) >= 0
            }
      }

      addToDeckOnBottom(card: Node, offset: number, sendToServer: boolean) {
            const cardComp = card.getComponent(Card)!;
            if (this.hasCard(card)) {
                  this._cards.splice(this._cards.indexOf(cardComp._cardId), 1)
            } else {
                  WrapperProvider.cardManagerWrapper.out.inDecksCardsIds.push(cardComp._cardId);
            }
            var newOffset = offset != 0 ? offset - 1 : offset
            this._cards.splice(0 + newOffset, 0, cardComp._cardId);
            card.setParent(null)
            const serverData = {
                  signal: Signal.DECK_ADD_TO_BOTTOM,
                  srvData: { deckType: this.deckType, cardId: cardComp._cardId, offset },
            };
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
            }
      }

      getCards() {
            return this._cards.map(cid => WrapperProvider.cardManagerWrapper.out.getCardById(cid))
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

            WrapperProvider.serverClientWrapper.out.send(Signal.DECK_ARRAGMENT, { deckType: this.deckType, arrangement: this._cards })

      }

      setDeckCards(cards: number[] | Node[]) {
            if (cards[0] instanceof Node) {
                  this._cards = (cards as Node[]).map(card => card.getComponent(Card)!._cardId)
            } else {
                  this._cards = cards as number[]
            }
      }

      setMouseHover() {
            debugger
            const meMouse = WrapperProvider.playerManagerWrapper.out.mePlayer?.getComponent(Player)?.mouse

            if (meMouse)
                  meMouse.setCardEnterAndLeaveEvents(this.node.getComponent(Card)!)
      }

      // LIFE-CYCLE CALLBACKS:

      onLoad() {

            const trans = this.getComponent(UITransform)!
            trans.width = CARD_WIDTH;
            trans.height = CARD_HEIGHT;
            this._cards = []


            // const sprite = this.topBlankCard.getComponent(Sprite);
            // if (this.topBlankCard.getComponent(Card)._isFlipped) { this.topBlankCard.getComponent(Card).flipCard(false) }
            // sprite.enabled = false;

      }

}
