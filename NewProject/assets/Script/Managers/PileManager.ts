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

  static init() {
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const playerComp = PlayerManager.players[i].getComponent(Player);
      playerComp.landingZones.push(PileManager.lootCardPileNode);
      ////cc.log(playerComp.landingZones)
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

  static addCardToPile(type: CARD_TYPE, card: cc.Node, sendToServer: boolean) {
    let originalPos
    cc.log(card.name + ' add to pile , send to server ' + sendToServer)
    switch (type) {
      case CARD_TYPE.LOOT:
        CardManager.onTableCards.push(card);
        PileManager.lootCardPile.push(card);
        card.setPosition(PileManager.lootCardPileNode.position);
        CardManager.disableCardActions(card);
        CardManager.makeCardPreviewable(card);
        break;
      case CARD_TYPE.MONSTER:
        originalPos = card.convertToWorldSpaceAR(card.position);
        card.parent = cc.find("Canvas");
        card.setPosition(card.parent.convertToNodeSpaceAR(originalPos));
        CardManager.onTableCards.push(card);
        PileManager.monsterCardPile.push(card);
        card.runAction(
          cc.moveTo(
            TIMEFORMONSTERDISCARD,
            PileManager.monsterCardPileNode.position
          )
        );
        if (card.getComponent(Monster).monsterPlace != null) {
          let monsterToPileTimeOut = () => {
            card.getComponent(Monster).monsterPlace.removeMonster(card, sendToServer);
            card.getComponent(Monster).monsterPlace.getNextMonster(sendToServer);
          };
          monsterToPileTimeOut.bind(this);
          if (sendToServer) {
            cc.log('')
            setTimeout(monsterToPileTimeOut, TIMEFORMONSTERDISCARD * 1000);
          }
        }
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
    if (sendToServer) {
      let srvData = { type: type, cardId: card.getComponent(Card).cardId };
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
