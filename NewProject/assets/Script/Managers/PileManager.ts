import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { CARD_TYPE, GAME_EVENTS, TIME_FOR_MONSTER_DISCARD } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Card from "../Entites/GameEntities/Card";
import Player from "../Entites/GameEntities/Player";
import Pile from "../Entites/Pile";
import CardManager from "./CardManager";
import PlayerManager from "./PlayerManager";
import AnimationManager from "./Animation Manager";
import Deck from "../Entites/GameEntities/Deck";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PileManager extends cc.Component {
  static lootCardPileNode: cc.Node = null;

  static treasureCardPileNode: cc.Node = null;

  static monsterCardPileNode: cc.Node = null;

  static lootCardPile: Pile = null;

  static monsterCardPile: Pile = null;

  static treasureCardPile: Pile = null;
  static isOver: boolean = false;

  static lootPlayPile: Pile = null;

  static async init() {

    PileManager.lootPlayPile.getComponent(Card)._cardId = ++CardManager.cardsId
    PileManager.lootCardPileNode.getComponent(Card)._cardId = ++CardManager.cardsId
    PileManager.treasureCardPileNode.getComponent(Card)._cardId = ++CardManager.cardsId
    PileManager.monsterCardPileNode.getComponent(Card)._cardId = ++CardManager.cardsId
    this.setDeck(PileManager.lootCardPile, CardManager.lootDeck.getComponent(Deck))
    this.setDeck(PileManager.treasureCardPile, CardManager.treasureDeck.getComponent(Deck))
    this.setDeck(PileManager.monsterCardPile, CardManager.monsterDeck.getComponent(Deck))
    const piles = [PileManager.lootPlayPile.node, PileManager.lootCardPileNode, PileManager.treasureCardPileNode, PileManager.monsterCardPileNode]
    piles.forEach(pile => CardManager.allCards.push(pile))
    piles.forEach(pile => {
      cc.log(`add animation node to ${pile.name}`)
      // AnimationManager.addAnimationNode(pile)
    });

  }

  static setDeck(pile: Pile, deck: Deck) {
    pile.deck = deck
    deck.pile = pile
  }

  static getTopCardOfPiles() {
    const topCards: cc.Node[] = [
      this.lootCardPile[this.lootCardPile.getCards().length - 1],
      this.monsterCardPile[this.monsterCardPile.getCards().length - 1],
      this.treasureCardPile[this.treasureCardPile.getCards().length - 1]
    ];
    return topCards;

  }

  static getPileByCard(card: cc.Node) {
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
        return this.lootCardPile
      }
    }
    for (const pileCard of this.treasureCardPile.getCards()) {
      if (pileCard == card) {
        return this.lootCardPile
      }
    }
  }

  static removeFromPile(card: cc.Node, sendToServer: boolean) {
    const pile = this.getPileByCard(card)
    pile.removeFromPile(card)
    if (sendToServer) {
      ServerClient.$.send(Signal.REMOVE_FROM_PILE, { cardId: card.getComponent(Card)._cardId });
    }
  }

  static async addCardToPile(type: CARD_TYPE, card: cc.Node, sendToServer: boolean) {
    switch (type) {

      case CARD_TYPE.LOOT:
        CardManager.onTableCards.push(card);
        if (sendToServer) {
          await CardManager.moveCardTo(card, PileManager.lootCardPileNode, sendToServer, true)
        }
        PileManager.lootCardPile.addCardToTopPile(card)
        break;
      case CARD_TYPE.LOOT_PLAY:
        CardManager.onTableCards.push(card);
        if (sendToServer) {
          await CardManager.moveCardTo(card, PileManager.lootPlayPile.node, sendToServer, true)
        }
        PileManager.lootPlayPile.addCardToTopPile(card)
        break;
      case CARD_TYPE.MONSTER:
        CardManager.onTableCards.push(card);
        if (sendToServer) {
          await CardManager.moveCardTo(card, PileManager.monsterCardPileNode, sendToServer, true)
        }
        PileManager.monsterCardPile.addCardToTopPile(card);
        if (card.getComponent(Monster).monsterPlace != null) {
        }
        break;
      case CARD_TYPE.TREASURE:
        if (CardManager.onTableCards.find(tableCard => tableCard.uuid == card.uuid) == undefined) {
          CardManager.onTableCards.push(card);
        }
        if (sendToServer) {
          await CardManager.moveCardTo(card, PileManager.monsterCardPileNode, sendToServer, true)
        }
        PileManager.treasureCardPile.addCardToTopPile(card);
        //  card.parent = this.treasureCardPileNode;
        card.setPosition(0, 0);
        //   this.isOver = true
        break;
      default:
        break;

    }
    CardManager.disableCardActions(card);
    CardManager.makeCardPreviewable(card);
    //await this.waitForCardMovement()
    if (sendToServer) {
      const srvData = { type: type, cardId: card.getComponent(Card)._cardId };
      ServerClient.$.send(Signal.MOVE_CARD_TO_PILE, srvData);
    }
  }
  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    PileManager.lootCardPileNode = cc.find("Canvas/LootCardPile");
    PileManager.treasureCardPileNode = cc.find("Canvas/TreasureCardPile");
    PileManager.monsterCardPileNode = cc.find("Canvas/MonsterCardPile");


    PileManager.lootCardPile = PileManager.lootCardPileNode.getComponent(Pile)
    PileManager.treasureCardPile = PileManager.treasureCardPileNode.getComponent(Pile)
    PileManager.monsterCardPile = PileManager.monsterCardPileNode.getComponent(Pile)
    PileManager.lootPlayPile = cc.find("Canvas/LootPlayPile").getComponent(Pile)

  }

  start() { }

  // update (dt) {}
}
