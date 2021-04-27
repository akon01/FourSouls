import { _decorator, Component, Node, find, log } from 'cc';
const { ccclass } = _decorator;

import { Signal } from "../../Misc/Signal";

import { CARD_TYPE, PASSIVE_EVENTS } from "../Constants";
import { Monster } from "../Entites/CardTypes/Monster";
import { Card } from "../Entites/GameEntities/Card";
import { Pile } from "../Entites/Pile";
import { Deck } from "../Entites/GameEntities/Deck";
import { WrapperProvider } from './WrapperProvider';
import { PassiveMeta } from './PassiveMeta';

@ccclass('PileManager')
export class PileManager extends Component {
      lootCardPileNode!: Node;

      treasureCardPileNode!: Node;

      monsterCardPileNode!: Node;

      lootCardPile!: Pile;

      monsterCardPile!: Pile;

      treasureCardPile!: Pile;
      isOver = false;

      lootPlayPile!: Pile;




      async init() {

            this.lootPlayPile.getComponent(Card)!._cardId = ++WrapperProvider.cardManagerWrapper.out.cardsId
            this.lootCardPileNode.getComponent(Card)!._cardId = ++WrapperProvider.cardManagerWrapper.out.cardsId
            this.treasureCardPileNode.getComponent(Card)!._cardId = ++WrapperProvider.cardManagerWrapper.out.cardsId
            this.monsterCardPileNode.getComponent(Card)!._cardId = ++WrapperProvider.cardManagerWrapper.out.cardsId
            this.setDeck(this.lootCardPile, WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck)!)
            this.setDeck(this.treasureCardPile, WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!)
            this.setDeck(this.monsterCardPile, WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!)
            const piles = [this.lootPlayPile.node, this.lootCardPileNode, this.treasureCardPileNode, this.monsterCardPileNode]
            piles.forEach(pile => WrapperProvider.cardManagerWrapper.out.allCards.push(pile))
            piles.forEach(pile => {
                  console.log(`add animation node to ${pile.name}`)
                  // AnimationManager.addAnimationNode(pile)
            });

      }

      setDeck(pile: Pile, deck: Deck) {
            pile.deck = deck
            deck.pile = pile
      }

      getTopCardOfPiles() {
            const topCards: Node[] = [
                  this.lootCardPile.getCards()[this.lootCardPile.getCards().length - 1],
                  this.monsterCardPile.getCards()[this.monsterCardPile.getCards().length - 1],
                  this.treasureCardPile.getCards()[this.treasureCardPile.getCards().length - 1]
            ];
            return topCards;

      }

      getPileByCard(card: Node) {
            for (const pileCard of this.lootCardPile.getCards()) {
                  if (pileCard == card) {
                        return this.lootCardPile
                  }
            }
            for (const pileCard of this.lootPlayPile.getCards()) {
                  if (pileCard == card) {
                        return this.lootPlayPile
                  }
            }
            for (const pileCard of this.monsterCardPile.getCards()) {
                  if (pileCard == card) {
                        return this.monsterCardPile
                  }
            }
            for (const pileCard of this.treasureCardPile.getCards()) {
                  if (pileCard == card) {
                        return this.treasureCardPile
                  }
            }
            return null
      }

      async removeFromPile(card: Node, sendToServer: boolean) {
            const pile = this.getPileByCard(card)
            if (!pile) { debugger; throw new Error(`Card '${card.name}' Is Not In Any Pile, Cannot Remove!`); }


            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.CARD_REMOVED_FROM_PILE, [], null, card)
            if (sendToServer) {
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  if (!afterPassiveMeta.continue) {
                        return
                  }
            }
            pile.removeFromPile(card)
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.REMOVE_FROM_PILE, { cardId: card.getComponent(Card)!._cardId });
                  await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
            }
      }

      async addCardToPile(type: CARD_TYPE, card: Node, sendToServer: boolean) {
            const cardComp = card.getComponent(Card)!;
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.CARD_ADDED_TO_PILE, [], null, card)
            if (sendToServer) {
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  if (!afterPassiveMeta.continue) {
                        return
                  }
            }
            switch (type) {
                  case CARD_TYPE.LOOT:
                        WrapperProvider.cardManagerWrapper.out.addOnTableCards([card]);
                        if (sendToServer) {
                              await WrapperProvider.cardManagerWrapper.out.moveCardTo(card, this.lootCardPileNode, sendToServer, true)
                        }
                        this.lootCardPile.addCardToTopPile(card)
                        break;
                  case CARD_TYPE.LOOT_PLAY:
                        WrapperProvider.cardManagerWrapper.out.addOnTableCards([card]);
                        if (sendToServer) {
                              await WrapperProvider.cardManagerWrapper.out.moveCardTo(card, this.lootPlayPile.node, sendToServer, true)
                        }
                        this.lootPlayPile.addCardToTopPile(card)
                        break;
                  case CARD_TYPE.MONSTER:
                        WrapperProvider.cardManagerWrapper.out.addOnTableCards([card]);
                        if (sendToServer) {
                              await WrapperProvider.cardManagerWrapper.out.moveCardTo(card, this.monsterCardPileNode, sendToServer, true)
                        }
                        this.monsterCardPile.addCardToTopPile(card);
                        if (card.getComponent(Monster)!.monsterPlace != null) {
                        }
                        break;
                  case CARD_TYPE.TREASURE:
                        if (WrapperProvider.cardManagerWrapper.out.getOnTableCards().find(tableCard => tableCard.uuid == card.uuid) == undefined) {
                              WrapperProvider.cardManagerWrapper.out.addOnTableCards([card]);
                        }
                        if (sendToServer) {
                              await WrapperProvider.cardManagerWrapper.out.moveCardTo(card, this.monsterCardPileNode, sendToServer, true)
                        }
                        this.treasureCardPile.addCardToTopPile(card);
                        //  card.parent = this.treasureCardPileNode;
                        card.setPosition(0, 0);
                        //   this.isOver = true
                        break;
                  default:
                        break;

            }
            WrapperProvider.cardManagerWrapper.out.disableCardActions(card);
            WrapperProvider.cardManagerWrapper.out.makeCardPreviewable(card);
            cardComp.isGoingToBeDestroyed = false
            //await this.waitForCardMovement()
            if (sendToServer) {
                  const srvData = { type: type, cardId: card.getComponent(Card)!._cardId };
                  WrapperProvider.serverClientWrapper.out.send(Signal.MOVE_CARD_TO_PILE, srvData);
            }
            await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
      }
      // LIFE-CYCLE CALLBACKS:

      onLoad() {
            const canvas = WrapperProvider.CanvasNode
            this.lootCardPileNode = find("LootCardPile", canvas)!;
            this.treasureCardPileNode = find("TreasureCardPile", canvas)!;
            this.monsterCardPileNode = find("MonsterCardPile", canvas)!;


            this.lootCardPile = this.lootCardPileNode.getComponent(Pile)!
            this.treasureCardPile = this.treasureCardPileNode.getComponent(Pile)!
            this.monsterCardPile = this.monsterCardPileNode.getComponent(Pile)!
            this.lootPlayPile = find("LootPlayPile", canvas)!.getComponent(Pile)!

      }

      // update (dt) {}
}
