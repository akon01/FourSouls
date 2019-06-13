import Server from "../../ServerClient/ServerClient";
import { ACTION_TYPE, CARD_TYPE, TIMETOBUY, TIMETODRAW } from "../Constants";
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

export interface Action {
  originPlayerId: number;
  actionTarget: cc.Node;
  data: {};
  actionType: ACTION_TYPE;
  hasCardEffect: boolean;
  playedCard: Card;

  showAction(data?: {});

  serverBrodcast(serverData?);
}

export class DrawCardAction implements Action {
  playedCard: Card;

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
  playedCard: Card;
  actionType = ACTION_TYPE.ACTIVECARDEFFECT;
  hasCardEffect = true;

  showAction() {
    let movedCardComp: Card = this.data.lootCard.getComponent(Card);
    this.playedCard = movedCardComp;
    this.playedCard.node.runAction(
      cc.moveTo(TIMETOPLAYLOOT, PileManager.lootCardPileNode.position)
    );
    setTimeout(() => {
      removeFromHand(this.data.lootCard, MainScript.currentPlayerComp.hand);
      PileManager.addCardToPile(CARD_TYPE.LOOT, this.data.lootCard);
      TurnsManager.currentTurn.lootCardPlays -= 1;
      let playerId = MainScript.currentPlayerComp.playerId;
      let cardId = movedCardComp.cardId;
      let data = { playerId, cardId };
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
  playedCard: Card;
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
  playedCard: Card;
  originPlayerId: number;
  actionTarget: cc.Node;
  data: { attackedMonster: cc.Node };
  actionType = ACTION_TYPE.PLAYERACTION;
  hasCardEffect = false;

  showAction() {
    let monster = this.data.attackedMonster;
    BattleManager.declareAttackOnMonster(monster);
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
  playedCard: Card;
  showAction(data?: { activatedCard: cc.Node }) {
    let card = this.data.activatedCard;
    this.playedCard = card.getComponent(Card);
    card.stopAllActions();
    switch (card.getComponent(Card).type) {
      case CARD_TYPE.CHAR:
        card.getComponent(Character).activated = true;
        card.runAction(cc.rotateTo(TIMETOROTATEACTIVATION, -90));
        break;
      case CARD_TYPE.CHARITEM:
        card.getComponent(CharacterItem).activated = true;
        card.runAction(cc.rotateTo(TIMETOROTATEACTIVATION, -90));
        break;
      case CARD_TYPE.LOOT:
        break;
      default:
        card.getComponent(Item).activated = true;
        card.runAction(cc.rotateTo(TIMETOROTATEACTIVATION, -90));
        break;
    }
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
