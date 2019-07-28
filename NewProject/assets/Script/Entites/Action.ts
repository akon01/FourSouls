import Server from "../../ServerClient/ServerClient";
import {
  ACTION_TYPE,
  CARD_TYPE,
  TIMETOBUY,
  TIMETODRAW,
  ROLL_TYPE,
  printMethodSignal,

  COLORS
} from "../Constants";
import MainScript from "../MainScript";
import ActionManager from "../Managers/ActionManager";
import BattleManager from "../Managers/BattleManager";
import CardManager from "../Managers/CardManager";
import PileManager from "../Managers/PileManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import { addCardToCardLayout } from "../Modules/HandModule";
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
import Deck from "./GameEntities/Deck";
import ChooseCard from "../CardEffectComponents/DataCollector/ChooseCard";
import CardPreview from "./CardPreview";
import Monster from "./CardTypes/Monster";
import MonsterField from "./MonsterField";
import MonsterCardHolder from "./MonsterCardHolder";

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

  async showAction() {
    let drawnCard = this.data.drawnCard;
    let player = PlayerManager.getPlayerById(this.originPlayerId).getComponent(
      Player
    );
    if (TurnsManager.currentTurn.PlayerId == this.originPlayerId) {
      TurnsManager.currentTurn.drawPlays -= 1;
    }
    CardManager.allCards.push(drawnCard);

    let comp = drawnCard.getComponent(Card)
    if (comp._isFlipped && this.originPlayerId == PlayerManager.mePlayer.getComponent(Player).playerId) {
      comp.flipCard()
    }
    await player.gainLoot(drawnCard, false)
    comp._ownedBy = player;
    return true

  }

  serverBrodcast(serverData) {
    let signal = serverData.signal;
    let data = serverData.srvData;
    Server.$.send(signal, data);
  }
}

export class EndTurnAction implements Action {
  playedCard: cc.Node;

  originPlayerId: number;
  actionTarget: cc.Node;
  data: {};
  actionType = ACTION_TYPE.PLAYERACTION;
  hasCardEffect = false;

  constructor(data: {}, originPlayerId: number) {
    this.data = data;
    this.originPlayerId = originPlayerId;
  }

  showAction() {

    TurnsManager.nextTurn();
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
  isOver = false;

  async showAction() {
    let movedCardComp: Card = this.data.lootCard.getComponent(Card);
    this.playedCard = movedCardComp.node;
    let player = PlayerManager.getPlayerById(this.originPlayerId).getComponent(Player);
    //   let timeOutToPlay = cc.callFunc(async () => {
    player.hand.removeCardFromLayout(movedCardComp.node)
    let playerId = player.playerId;
    let cardId = movedCardComp._cardId;
    let data = { playerId, cardId };
    this.isOver = true;



    return true

  }

  async waitForAction(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let check = () => {
        if (this.isOver) {

          resolve(true);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
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

export class AddItemAction implements Action {
  playedCard: cc.Node;
  originPlayerId: number;
  actionTarget: cc.Node;
  data: { movedCard: cc.Node; playerDeskComp: PlayerDesk };
  actionType = ACTION_TYPE.PLAYERACTION;
  hasCardEffect = false;


  async showAction() {
    let movedCardComp: Card = this.data.movedCard.getComponent(Card);
    let canvas = cc.find("Canvas");
    // if (TurnsManager.currentTurn.PlayerId == this.originPlayerId) {

    //   TurnsManager.currentTurn.buyPlays -= 1;
    // }
    // TurnsManager.currentTurn.buyPlays -= 1;
    Store.storeCards = Store.storeCards.filter(
      card => card != movedCardComp.node
    );
    // let itemPosInCanvasTrans = canvas.convertToNodeSpaceAR(
    //   movedCardComp.node.convertToWorldSpaceAR(movedCardComp.node.getPosition())
    // );
    // movedCardComp.node.parent = canvas;
    // movedCardComp.node.setPosition(itemPosInCanvasTrans);
    // let moveAction = cc.moveTo(TIMETOBUY, this.data.playerDeskComp.node.getPosition());

    movedCardComp._ownedBy = MainScript.currentPlayerComp;
    this.data.playerDeskComp.addToDesk(movedCardComp);
    return true;
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
  data: {
    attackedMonster: cc.Node;
    playerId: number;
    isFromServer?: boolean;
    cardHolderId: number;
  };
  actionType = ACTION_TYPE.PLAYERACTION;
  hasCardEffect = false;

  async showAction() {
    let monsterCard = this.data.attackedMonster;
    let monsterDeck = CardManager.monsterDeck.getComponent(Deck);
    let monsterCardHolder: MonsterCardHolder = MonsterField.getMonsterPlaceById(
      this.data.cardHolderId
    );
    let monsterField = cc
      .find("Canvas/MonsterField")
      .getComponent(MonsterField);
    let monsterId;
    let attackedMonster;
    if (this.data.isFromServer) {
    } else {
      if (monsterCard.getComponent(Monster).monsterPlace == null) {
        monsterField.addMonsterToExsistingPlace(
          monsterCardHolder.id,
          monsterCard,
          true
        );
      }
    }

    BattleManager.declareAttackOnMonster(monsterCard);
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

export class AttackMonster implements Action {
  originPlayerId: number;
  actionTarget: cc.Node;
  data: {};
  actionType: ACTION_TYPE;
  hasCardEffect: boolean = true;
  playedCard: cc.Node;

  showAction(data?: {}) {


  }
  serverBrodcast(serverData?: any) {
    // let signal = serverData.signal;
    // let data = serverData.srvData;
    // Server.$.send(signal, data);
  }

  constructor(
    data: { rollType: ROLL_TYPE; sendToServer: boolean },
    originPlayerId: number,
    diceNode: cc.Node
  ) {
    this.playedCard = diceNode;
    this.originPlayerId = originPlayerId;
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
    card.runAction(cc.fadeTo(2, 255))


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
  hasCardEffect: boolean = false;
  rollType: ROLL_TYPE = null;
  sendToServer: boolean;
  serverNumberRolled: number = -1;

  //@printMethodStarted(COLORS.RED)
  async showAction(data?) {
    if (this.serverNumberRolled == -1) {
      let dice = this.playedCard.getComponent(Dice);
      let numberRolled;
      Server.$.send(Signal.ROLLDICE, { playerId: this.originPlayerId });
      numberRolled = await dice.rollDice(this.rollType);
      Server.$.send(Signal.ROLLDICEENDED, {
        playerId: this.originPlayerId,
        numberRolled: numberRolled
      });
      this.serverNumberRolled = numberRolled;
    }
    return new Promise((resolve, reject) => {
      resolve(this.serverNumberRolled);
    });
  }
  serverBrodcast(serverData?: any) {
    // let signal = serverData.signal;
    // let data = serverData.srvData;
    // Server.$.send(signal, data);
  }

  constructor(
    data: { rollType: ROLL_TYPE; sendToServer: boolean },
    originPlayerId: number,
    diceNode: cc.Node,
    serverNumberRolled?: number
  ) {
    this.playedCard = diceNode;
    if (serverNumberRolled) {
      this.serverNumberRolled = serverNumberRolled;
    }
    this.rollType = data.rollType;
    this.sendToServer = data.sendToServer;
    this.originPlayerId = originPlayerId;
  }
}
