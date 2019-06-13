import TurnsManager from "./Managers/TurnsManager";
import { MAX_PLAYERS } from "./Constants";
import Server from "../ServerClient/ServerClient";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

var id = 1;

var cardid = 1;

@ccclass
export default class buttonScript extends cc.Component {
  @property(cc.Prefab)
  cardPrefab: cc.Prefab = null;

  // addToHand(){

  //     let turns:Turns = cc.find('MainScript/Turns').getComponent('Turns')
  //     let card = cc.find('Canvas/blue baby');
  //     let hand = cc.find('player'+turns.currentTurn.turnId+'/Hand')

  //     card.parent = hand;
  //     let handComp:Hand = hand.getComponent("Hand");
  //     handComp.addToHandCards(card)
  // }

  changePlayers() {
    id = (id + 1) % Server.numOfPlayers;
    if (id == 0) {
      id = 2;
    }
    return id;
  }

  nextTurnClick() {
    var turnComp: TurnsManager = cc
      .find("MainScript/TurnsManager")
      .getComponent("TurnsManager");
    TurnsManager.nextTurn(false);
  }

  addNewCard() {
    let newCard = cc.instantiate(this.cardPrefab);
    newCard.name = "card" + cardid;
    cardid++;
    cc.director
      .getScene()
      .getChildByName("Canvas")
      .addChild(newCard);
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {}

  start() {}

  // update (dt) {}
}
