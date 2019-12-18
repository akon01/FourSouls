import PlayerManager from "./PlayerManager";
import Player from "../Entites/GameEntities/Player";
import { CARD_TYPE, TIME_FOR_MONSTER_DISCARD, GAME_EVENTS } from "../Constants";
import CardManager from "./CardManager";
import Monster from "../Entites/CardTypes/Monster";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import Card from "../Entites/GameEntities/Card";
import Pile from "../Entites/Pile";


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

  static lootPlaceTest: cc.Node = null;

  static init() {

    PileManager.lootPlaceTest.getComponent(Card)._cardId = ++CardManager.cardsId
    PileManager.lootCardPileNode.getComponent(Card)._cardId = ++CardManager.cardsId
    PileManager.treasureCardPileNode.getComponent(Card)._cardId = ++CardManager.cardsId
    PileManager.monsterCardPileNode.getComponent(Card)._cardId = ++CardManager.cardsId
    CardManager.allCards.push(PileManager.lootPlaceTest, PileManager.lootCardPileNode, PileManager.treasureCardPileNode, PileManager.monsterCardPileNode)
  }

  static getTopCardOfPiles() {
    let topCards: cc.Node[] = [
      this.lootCardPile[this.lootCardPile.getCards().length - 1],
      this.monsterCardPile[this.monsterCardPile.getCards().length - 1],
      this.treasureCardPile[this.treasureCardPile.getCards().length - 1]
    ];
    return topCards;

  }


  static async addCardToPile(type: CARD_TYPE, card: cc.Node, sendToServer: boolean) {
    switch (type) {

      case CARD_TYPE.LOOT:
        CardManager.onTableCards.push(card);

        if (sendToServer) {

          await CardManager.moveCardTo(card, PileManager.lootCardPileNode, sendToServer, true)
        }
        PileManager.lootCardPile.addCardToTopPile(card)
        //    card.parent = this.lootCardPileNode;
        //card.setPosition(0, 0);
        //this.isOver = true
        break;
      case CARD_TYPE.MONSTER:
        CardManager.onTableCards.push(card);

        if (sendToServer) {

          await CardManager.moveCardTo(card, PileManager.monsterCardPileNode, sendToServer, true)
        }
        PileManager.monsterCardPile.addCardToTopPile(card);
        // card.parent = this.monsterCardPileNode;
        if (card.getComponent(Monster).monsterPlace != null) {
          // if (sendToServer) {
          //   card.getComponent(Monster).monsterPlace.removeMonster(card, sendToServer); 
          //   card.getComponent(Monster).monsterPlace.getNextMonster(sendToServer);
          //   //this.isOver = true;
          // }
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
      let srvData = { type: type, cardId: card.getComponent(Card)._cardId };
      ServerClient.$.send(Signal.MOVE_CARD_TO_PILE, srvData);
    }
  }
  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    PileManager.lootCardPileNode = cc.find("Canvas/LootCardPile");
    PileManager.treasureCardPileNode = cc.find("Canvas/TreasureCardPile");
    PileManager.monsterCardPileNode = cc.find("Canvas/MonsterCardPile");
    PileManager.lootPlaceTest = cc.find('Canvas/lootTest')

    PileManager.lootCardPile = PileManager.lootCardPileNode.getComponent(Pile)
    PileManager.treasureCardPile = PileManager.treasureCardPileNode.getComponent(Pile)
    PileManager.monsterCardPile = PileManager.monsterCardPileNode.getComponent(Pile)

  }

  start() { }

  // update (dt) {}
}
