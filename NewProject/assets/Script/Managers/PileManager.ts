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

    if (card.getComponent(Card).isFlipped) {
      card.getComponent(Card).flipCard();
    }
    switch (type) {
      case CARD_TYPE.LOOT:
        originalPos = card.convertToWorldSpaceAR(card.position);
        card.parent = cc.find("Canvas");
        card.setPosition(card.parent.convertToNodeSpaceAR(originalPos));
        CardManager.onTableCards.push(card);
        PileManager.lootCardPile.push(card);
        let lootCardPilePos = this.lootCardPileNode.convertToWorldSpaceAR(this.lootCardPileNode.getPosition())
        let goTo = card.parent.convertToNodeSpaceAR(lootCardPilePos)
        moveAction = cc.moveTo(
          TIMEFORMONSTERDISCARD,
          this.lootCardPileNode.getPosition()
        )
        card.runAction(
          cc.sequence(moveAction, cc.callFunc(() => { card.parent = this.lootCardPileNode; card.setPosition(0, 0); this.isOver = true }))
        );
        //    card.setPosition(PileManager.lootCardPileNode.position);
        CardManager.disableCardActions(card);
        CardManager.makeCardPreviewable(card);
        break;
      case CARD_TYPE.MONSTER:
        originalPos = card.convertToWorldSpaceAR(card.position);
        card.parent = cc.find("Canvas");
        card.setPosition(card.parent.convertToNodeSpaceAR(originalPos));
        CardManager.onTableCards.push(card);
        PileManager.monsterCardPile.push(card);

        moveAction = cc.moveTo(
          TIMEFORMONSTERDISCARD,
          PileManager.monsterCardPileNode.position
        )
        card.runAction(
          cc.sequence(moveAction, cc.callFunc(() => {
            if (card.getComponent(Monster).monsterPlace != null) {
              if (sendToServer) {
                card.getComponent(Monster).monsterPlace.removeMonster(card, sendToServer);
                card.getComponent(Monster).monsterPlace.getNextMonster(sendToServer);
                this.isOver = true;
              }
            }
          }))
        );

        //    card.setPosition();
        CardManager.disableCardActions(card);
        CardManager.makeCardPreviewable(card);
        break;
      case CARD_TYPE.TREASURE:
        originalPos = card.convertToWorldSpaceAR(card.position);
        card.parent = cc.find("Canvas");
        card.setPosition(card.parent.convertToNodeSpaceAR(originalPos));
        if (CardManager.onTableCards.find(tableCard => tableCard.uuid == card.uuid) == undefined) {
          CardManager.onTableCards.push(card);
        }
        PileManager.treasureCardPile.push(card);
        card.runAction(cc.moveTo(TIMEFORMONSTERDISCARD, (PileManager.treasureCardPileNode.position)));
        CardManager.disableCardActions(card);
        CardManager.makeCardPreviewable(card);
        break;
      default:
        break;
    }
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
