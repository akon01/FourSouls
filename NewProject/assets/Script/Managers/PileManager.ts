import PlayerManager from "./PlayerManager";
import Player from "../Entites/GameEntities/Player";
import { CARD_TYPE, TIMEFORMONSTERDISCARD } from "../Constants";
import CardManager from "./CardManager";
import Monster from "../Entites/CardTypes/Monster";
import Server from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import Card from "../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PileManager extends cc.Component {
  static lootCardPileNode: cc.Node = null;

  static treasureCardPileNode: cc.Node = null;

  static monsterCardPileNode: cc.Node = null;

  static lootCardPile: cc.Node[] = [];

  static monsterCardPile: cc.Node[] = [];

  static treasureCardPile: cc.Node[] = [];
  static isOver: boolean = false;

  static init() {
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const playerComp = PlayerManager.players[i].getComponent(Player);
      playerComp.landingZones.push(PileManager.lootCardPileNode);

    }
    PileManager.lootCardPileNode.getComponent(Card)._cardId = ++CardManager.cardsId
    PileManager.treasureCardPileNode.getComponent(Card)._cardId = ++CardManager.cardsId
    PileManager.monsterCardPileNode.getComponent(Card)._cardId = ++CardManager.cardsId
    CardManager.allCards.push(PileManager.lootCardPileNode, PileManager.treasureCardPileNode, PileManager.monsterCardPileNode)
  }

  static getTopCardOfPiles() {
    let topCards: cc.Node[] = [
      this.lootCardPile[this.lootCardPile.length - 1],
      this.monsterCardPile[this.monsterCardPile.length - 1],
      this.treasureCardPile[this.treasureCardPile.length - 1]
    ];
    return topCards;

  }

  static async waitForCardMovement(): Promise<boolean> {
    //w8 for a server message with a while,after the message is recived (should be a stack of effects with booleans) resolve with stack of effects.
    return new Promise((resolve, reject) => {
      let check = () => {
        if (this.isOver) {
          this.isOver = false;
          resolve(true);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  static async addCardToPile(type: CARD_TYPE, card: cc.Node, sendToServer: boolean) {
    let originalPos
    let moveAction

    if (card.getComponent(Card)._isFlipped) {
      card.getComponent(Card).flipCard();
    }
    // originalPos = card.convertToWorldSpaceAR(card.position);
    // card.parent = cc.find("Canvas");
    // card.setPosition(card.parent.convertToNodeSpaceAR(originalPos));
    let goTo
    switch (type) {

      case CARD_TYPE.LOOT:
        CardManager.onTableCards.push(card);
        PileManager.lootCardPile.push(card);

        await CardManager.moveCardTo(card, PileManager.lootCardPileNode, sendToServer)
        card.parent = this.lootCardPileNode;
        //card.setPosition(0, 0);
        this.isOver = true
        break;
      case CARD_TYPE.MONSTER:
        CardManager.onTableCards.push(card);
        PileManager.monsterCardPile.push(card);
        await CardManager.moveCardTo(card, PileManager.monsterCardPileNode, sendToServer)
        card.parent = this.monsterCardPileNode;
        if (card.getComponent(Monster).monsterPlace != null) {
          if (sendToServer) {
            card.getComponent(Monster).monsterPlace.removeMonster(card, sendToServer);
            card.getComponent(Monster).monsterPlace.getNextMonster(sendToServer);
            this.isOver = true;
          }
        }

        break;
      case CARD_TYPE.TREASURE:
        if (CardManager.onTableCards.find(tableCard => tableCard.uuid == card.uuid) == undefined) {
          CardManager.onTableCards.push(card);
        }
        PileManager.treasureCardPile.push(card);
        await CardManager.moveCardTo(card, PileManager.monsterCardPileNode, sendToServer)
        card.parent = this.treasureCardPileNode;
        card.setPosition(0, 0);
        this.isOver = true
        break;
      default:
        break;

    }
    CardManager.disableCardActions(card);
    CardManager.makeCardPreviewable(card);
    await this.waitForCardMovement()
    if (sendToServer) {
      let srvData = { type: type, cardId: card.getComponent(Card)._cardId };
      Server.$.send(Signal.MOVECARDTOPILE, srvData);
    }
  }
  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    PileManager.lootCardPileNode = cc.find("Canvas/LootCardPile");
    PileManager.treasureCardPileNode = cc.find("Canvas/TreasureCardPile");
    PileManager.monsterCardPileNode = cc.find("Canvas/MonsterCardPile");

  }

  start() { }

  // update (dt) {}
}
