import Server from "../../ServerClient/ServerClient";
import {
  ACTION_TYPE,
  CARD_TYPE,
  TIMETOBUY,
  TIMETODRAW,
  ROLL_TYPE,
  printMethodEnded,
  printMethodSignal,
  printMethodStarted,
  COLORS
} from "../Constants";
import MainScript from "../MainScript";
import ActionManager from "../Managers/ActionManager";
import BattleManager from "../Managers/BattleManager";
import CardManager from "../Managers/CardManager";
import PileManager from "../Managers/PileManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import { addCardToCardLayout, removeFromHand } from "../Modules/HandModule";
import { TIMETOPLAYLOOT, TIMETOROTATEACTIVATION } from "./../Constants";
import Character from "./CardTypes/Character";
import CharacterItem from "./CardTypes/CharacterItem";
import Item from "./CardTypes/Item";
import Card from "./GameEntities/Card";
import Player from "./GameEntities/Player";
import PlayerDesk from "./PlayerDesk";
import Store from "./GameEntities/Store";
import Dice from "./GameEntities/Dice";
import Signal from "../../Misc/Signal";
import CardEffect from "./CardEffect";
import { rejects } from "assert";

export interface Action {
  originPlayerId: number;
  actionTarget: cc.Node;
  data: {};
  actionType: ACTION_TYPE;
  hasCardEffect: boolean;
  playedCard: cc.Node;

  showAction(data?: {});

  serverBrodcast(serverData?);
}

export class DrawCardAction implements Action {
  playedCard: cc.Node;

  originPlayerId: number;
  actionTarget: cc.Node;
  data: { drawnCard: cc.Node };
  actionType = ACTION_TYPE.PLAYERACTION;
  hasCardEffect = false;

  constructor(data: { drawnCard: cc.Node }, originPlayerId: number) {
    this.data = data;
    this.originPlayerId = originPlayerId;
  }

  showAction() {
    let drawnCard = this.data.drawnCard;
    let player = PlayerManager.getPlayerById(this.originPlayerId).getComponent(
      Player
    );
    drawnCard.setPosition(CardManager.lootDeck.getPosition());
    drawnCard.parent = cc.find("Canvas");
    let handPos = player.hand.node.getPosition();
    CardManager.allCards.push(drawnCard);
    drawnCard.runAction(cc.moveTo(TIMETODRAW, handPos));
    setTimeout(() => {
      addCardToCardLayout(drawnCard, player.hand, true);
      drawnCard.getComponent(Card).ownedBy = player;
      TurnsManager.currentTurn.drawPlays -= 1;
      ActionManager.updateActions();
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    }, (TIMETODRAW + 0.1) * 1000);
  }

  serverBrodcast(serverData) {
    let signal = serverData.signal;
    let data = serverData.srvData;
    Server.$.send(signal, data);
  }
}

export class MoveLootToPile implements Action {
  originPlayerId: number;
  actionTarget: cc.Node;
  data: { lootCard: cc.Node };
  playedCard: cc.Node;
  actionType = ACTION_TYPE.ACTIVECARDEFFECT;
  hasCardEffect = true;

  showAction() {
    let movedCardComp: Card = this.data.lootCard.getComponent(Card);
    this.playedCard = movedCardComp.node;
    this.playedCard.runAction(
      cc.moveTo(TIMETOPLAYLOOT, PileManager.lootCardPileNode.position)
    );
    setTimeout(() => {
      removeFromHand(this.data.lootCard, MainScript.currentPlayerComp.hand);
      PileManager.addCardToPile(CARD_TYPE.LOOT, this.data.lootCard);
      TurnsManager.currentTurn.lootCardPlays -= 1;
      let playerId = MainScript.currentPlayerComp.playerId;
      let cardId = movedCardComp.cardId;
      let data = { playerId, cardId };
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    }, (TIMETOPLAYLOOT + 0.1) * 1000);
  }

  serverBrodcast(serverData) {
    let signal = serverData.signal;
    let data = serverData.srvData;
    Server.$.send(signal, data);
  }

  constructor(data: { lootCard: cc.Node }, originPlayerId: number) {
    this.data = data;
    this.originPlayerId = originPlayerId;
  }
}

export class BuyItemAction implements Action {
  playedCard: cc.Node;
  originPlayerId: number;
  actionTarget: cc.Node;
  data: { movedCard: cc.Node; playerDeskComp: PlayerDesk };
  actionType = ACTION_TYPE.PLAYERACTION;
  hasCardEffect = false;

  showAction() {
    let movedCardComp: Card = this.data.movedCard.getComponent("Card");
    let canvas = cc.find("Canvas");
    Store.storeCards = Store.storeCards.filter(
      card => card != movedCardComp.node
    );
    let itemPosInCanvasTrans = canvas.convertToNodeSpaceAR(
      movedCardComp.node.convertToWorldSpaceAR(movedCardComp.node.getPosition())
    );
    // canvas.convertToNodeSpaceAR(
    // );
    cc.log(itemPosInCanvasTrans);
    movedCardComp.node.parent = canvas;
    movedCardComp.node.setPosition(itemPosInCanvasTrans);
    movedCardComp.node.runAction(
      cc.moveTo(TIMETOBUY, this.data.playerDeskComp.node.getPosition())
    );
    let movedCardItemComp: Item = this.data.movedCard.getComponent(Item);
    setTimeout(() => {
      movedCardComp.ownedBy = MainScript.currentPlayerComp;
      MainScript.currentPlayerComp.addItem(
        movedCardItemComp,
        this.data.movedCard
      );
      TurnsManager.currentTurn.buyPlays -= 1;
      this.data.playerDeskComp.addToDesk(movedCardComp);
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    }, (TIMETOBUY + 0.1) * 1000);
  }

  serverBrodcast(serverData) {
    let signal = serverData.signal;
    let data = serverData.srvData;
    Server.$.send(signal, data);
  }

  constructor(data) {
    this.data = data;
  }
}

export class DeclareAttackAction implements Action {
  playedCard: cc.Node;
  originPlayerId: number;
  actionTarget: cc.Node;
  data: { attackedMonster: cc.Node };
  actionType = ACTION_TYPE.PLAYERACTION;
  hasCardEffect = false;

  showAction() {
    let monster = this.data.attackedMonster;
    BattleManager.declareAttackOnMonster(monster);
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  serverBrodcast(serverData) {
    let signal = serverData.signal;
    let data = serverData.srvData;
    Server.$.send(signal, data);
  }

  constructor(data) {
    this.data = data;
  }
}

export class ActivateItemAction implements Action {
  originPlayerId: number;
  actionTarget: cc.Node;
  data: { activatedCard: cc.Node };
  actionType: ACTION_TYPE;
  hasCardEffect: boolean = true;
  playedCard: cc.Node;
  showAction(data?: { activatedCard: cc.Node }) {
    let card = this.data.activatedCard;
    this.playedCard = card;
    card.stopAllActions();

    switch (card.getComponent(Card).type) {
      case CARD_TYPE.CHAR:
        card.getComponent(Item).useItem();
        //card.runAction(cc.rotateTo(TIMETOROTATEACTIVATION, -90));
        break;
      case CARD_TYPE.CHARITEM:
        card.getComponent(CharacterItem).useItem();
        //  card.runAction(cc.rotateTo(TIMETOROTATEACTIVATION, -90));
        break;
      case CARD_TYPE.LOOT:
        break;
      default:
        card.getComponent(Item).useItem();
        //card.runAction(cc.rotateTo(TIMETOROTATEACTIVATION, -90));
        break;
    }
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
  serverBrodcast(serverData?: any) {
    let signal = serverData.signal;
    let data = serverData.srvData;
    Server.$.send(signal, data);
  }

  constructor(data, originPlayerId: number) {
    this.data = data;
    this.originPlayerId = originPlayerId;
  }
}

export class ActivatePassiveAction implements Action {
  originPlayerId: number;
  actionTarget: cc.Node;
  data: { activatedCard: cc.Node; passiveIndex: number };
  actionType: ACTION_TYPE;
  hasCardEffect: boolean = true;
  playedCard: cc.Node;
  passiveIndex: number;
  showAction(data?: { activatedCard: cc.Node }) {
    let card = this.data.activatedCard;
    this.playedCard = card;
    card.stopAllActions();
    cc.log("activate passive effect");
    this.passiveIndex;
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
  serverBrodcast(serverData?: any) {
    let signal = serverData.signal;
    let data = serverData.srvData;
    Server.$.send(signal, data);
  }

  constructor(
    data: { activatedCard: cc.Node; passiveIndex: number },
    originPlayerId: number
  ) {
    this.passiveIndex = data.passiveIndex;
    this.data = data;
    this.originPlayerId = originPlayerId;
  }
}

export class RollDiceAction implements Action {
  playedCard: cc.Node;
  originPlayerId: number;
  actionTarget: cc.Node;
  data: {
    numberRolled: number;
    rollType: ROLL_TYPE;
    sendToServer: boolean;
  } = null;
  actionType: ACTION_TYPE = ACTION_TYPE.ROLL;
  hasCardEffect: boolean = true;
  rollType: ROLL_TYPE = null;
  sendToServer: boolean;
  serverNumberRolled: number;

  //@printMethodStarted(COLORS.RED)
  async showAction(data?) {
    cc.log("show action on roll dice");

    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
  serverBrodcast(serverData?: any) {
    let signal = serverData.signal;
    let data = serverData.srvData;
    Server.$.send(signal, data);
  }

  constructor(
    data: { rollType: ROLL_TYPE; sendToServer: boolean },
    originPlayerId: number,
    playedCard: cc.Node,
    serverNumberRolled?: number
  ) {
    this.playedCard = playedCard;
    this.serverNumberRolled = serverNumberRolled;
    this.rollType = data.rollType;
    this.sendToServer = data.sendToServer;
    this.originPlayerId = originPlayerId;
  }
}
