import PlayerManager from "./PlayerManager";
import Player from "../Entites/GameEntities/Player";
import { CARD_TYPE } from "../Constants";
import CardManager from "./CardManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PileManager extends cc.Component {
  static lootCardPileNode: cc.Node = null;

  static treasureCardPileNode: cc.Node = null;

  static monsterCardPileNode: cc.Node = null;

  static lootCardPile: cc.Node[] = [];

  static init() {
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const playerComp = PlayerManager.players[i].getComponent(Player);
      playerComp.landingZones.push(PileManager.lootCardPileNode);
      //cc.log(playerComp.landingZones)
    }
  }

  static addCardToPile(type: CARD_TYPE, card: cc.Node) {
    switch (type) {
      case CARD_TYPE.LOOT:
        CardManager.onTableCards.push(card);
        PileManager.lootCardPile.push(card);
        card.setPosition(PileManager.lootCardPileNode.position);
        CardManager.disableCardActions(card);
        CardManager.makeCardPreviewable(card);
        break;

      default:
        break;
    }
  }
  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    PileManager.lootCardPileNode = cc.find("Canvas/LootCardPile");
    PileManager.treasureCardPileNode = cc.find("Canvas/TreasureCardPile");
    PileManager.monsterCardPileNode = cc.find("Canvas/MonsterCardPile");
  }

  start() {}

  // update (dt) {}
}
