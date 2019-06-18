import Signal from "../../Misc/Signal";
import Server from "../../ServerClient/ServerClient";
import { ROLL_TYPE, ACTION_TYPE } from "../Constants";
import { Action, ActivatePassiveAction } from "../Entites/Action";
import { CardLayout } from "../Entites/CardLayout";
import Item from "../Entites/CardTypes/Item";
import Card from "../Entites/GameEntities/Card";
import Deck from "../Entites/GameEntities/Deck";
import Dice from "../Entites/GameEntities/Dice";
import Player from "../Entites/GameEntities/Player";
import Store from "../Entites/GameEntities/Store";
import MonsterField from "../Entites/MonsterField";
import MainScript from "../MainScript";
import { getCurrentPlayer, Turn } from "../Modules/TurnsModule";
import { COLORS, printMethodSignal, printMethodStarted } from "./../Constants";
import { ServerEffect } from "./../Entites/ServerCardEffect";
import BattleManager from "./BattleManager";
import ButtonManager from "./ButtonManager";
import CardManager from "./CardManager";
import PlayerManager from "./PlayerManager";
import TurnsManager from "./TurnsManager";
import CardPreview from "../Entites/CardPreview";
import PassiveManager from "./PassiveManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActionManager extends cc.Component {
  static currentPlayer: cc.Node = null;
  static allPlayers: cc.Node[] = [];
  static currentTurn: Turn = null;
  static turnsManager: cc.Node = null;
  static playersManager: cc.Node = null;
  static cardManager: cc.Node = null;
  static decks: cc.Node[] = [];
  static ButtonManager: cc.Node = null;
  static pileManager: cc.Node = null;
  static actionStack: Action[] = [];
  static serverCardEffectStack: ServerEffect[] = [];
  static noMoreActionsBool: boolean = false;
  static inReactionPhase: boolean = false;

  static lootPlayedInAction(playerId: any, cardId: any) {
    let card: Card = CardManager.getCardById(cardId).getComponent(Card);
  }

  static updateActionsForTurnPlayer(player: cc.Node) {
    this.decks = CardManager.getAllDecks();
    let lootDeck = CardManager.lootDeck.getComponent(Deck);
    lootDeck.interactive = true;
    let treasureDeck = CardManager.treasureDeck.getComponent(Deck);
    treasureDeck.interactive = true;
    let monsterDeck = CardManager.monsterDeck.getComponent(Deck);
    let monsterTopCard = monsterDeck.topCard;
    //set up components
    var currentPlayerComp: Player = player.getComponent(Player);
    var currentPlayerHand: cc.Node = player.getChildByName("Hand");
    var currentPlayerHandComp: CardLayout = currentPlayerHand.getComponent(
      CardLayout
    );

    //make next turn btn available
    ButtonManager.nextTurnButton.getComponent(cc.Button).interactable = true;

    //update player available reactions
    currentPlayerComp.calculateReactions();

    //make all table cards not moveable but available for preview
    if (CardManager.onTableCards.length != 0) {
      for (let i = 0; i < CardManager.onTableCards.length; i++) {
        const card = CardManager.onTableCards[i];

        CardManager.disableCardActions(card);
        CardManager.makeCardPreviewable(card);
      }
    }

    //if not in battle pahse allow other actions (buying,playing turnLoot,activating itmes,attacking a monster)
    if (!TurnsManager.currentTurn.battlePhase) {
      //enable drawing loot by enabling CardDrawable component on topBlankCard of loot deck
      if (TurnsManager.currentTurn.drawPlays > 0) {
        CardManager.makeDeckNotDrawable(CardManager.lootDeck);
        CardManager.makeDeckDrawable(CardManager.lootDeck, currentPlayerComp);
      } else {
        CardManager.makeDeckNotDrawable(CardManager.lootDeck);
      }
      //make store cards buyable (add check for money)
      if (
        TurnsManager.currentTurn.buyPlays > 0
        //&& player.getComponent(Player).coins >= 10
      ) {
        for (let i = 0; i < Store.storeCards.length; i++) {
          const storeCard = Store.storeCards[i];
          CardManager.makeItemBuyable(storeCard, currentPlayerComp);
        }

        if (treasureDeck.drawnCard != null) {
          let treasureDeckTopCard = treasureDeck.drawnCard;
          CardManager.makeItemBuyable(treasureDeckTopCard, currentPlayerComp);
        }
      } else {
        for (let i = 0; i < Store.storeCards.length; i++) {
          const storeCard = Store.storeCards[i];
          CardManager.disableCardActions(storeCard);
          CardManager.makeCardPreviewable(storeCard);
        }
        if (treasureDeck.drawnCard != null) {
          let treasureDeckTopCard = treasureDeck.drawnCard;
          CardManager.disableCardActions(treasureDeckTopCard);
          //  CardManager.makeCardPreviewable(treasureDeckTopCard);
        }
      }
      //make monster cards attackable
      if (TurnsManager.currentTurn.attackPlays > 0) {
        for (let i = 0; i < MonsterField.activeMonsters.length; i++) {
          const activeMonster = MonsterField.activeMonsters[i];

          CardManager.disableCardActions(activeMonster);
          CardManager.makeMonsterAttackable(activeMonster);
        }
        CardManager.makeMonsterAttackable(monsterTopCard);
      } else {
        for (let i = 0; i < MonsterField.activeMonsters.length; i++) {
          const activeMonster = MonsterField.activeMonsters[i];
          CardManager.disableCardActions(activeMonster);
        }
        CardManager.disableCardActions(monsterTopCard);
      }
      //make currnet player loot card playable
      if (TurnsManager.currentTurn.lootCardPlays > 0) {
        for (let i = 0; i < currentPlayerHandComp.layoutCards.length; i++) {
          const card = currentPlayerHandComp.layoutCards[i];
          CardManager.disableCardActions(card);
          CardManager.makeLootPlayable(card, currentPlayerComp);
          CardManager.setOriginalSprites(currentPlayerHandComp.layoutCards);
        }
      } else {
        for (let i = 0; i < currentPlayerHandComp.layoutCards.length; i++) {
          const card = currentPlayerHandComp.layoutCards[i];
          CardManager.disableCardActions(card);
          CardManager.makeCardPreviewable(card);
        }
      }
      //if Items are charged make them playable
      let playerItems = player.getComponent(Player).activeItems;
      for (let i = 0; i < playerItems.length; i++) {
        const item = playerItems[i].getComponent(Item);
        if (item.activated == false) {
          CardManager.makeItemActivateable(item.node);
        } else {
          CardManager.disableCardActions(item.node);
        }
      }

      player.getComponentInChildren(Dice).disableRoll();

      //if in battle phase do battle
    } else {
      //if the monster is not dead
      cc.log("In battle");
      //enable activating items
      if (BattleManager.currentlyAttackedMonster.currentHp > 0) {
        let playerItems = player.getComponent(Player).activeItems;
        for (let i = 0; i < playerItems.length; i++) {
          const item = playerItems[i].getComponent(Item);
          if (item.activated == false) {
            CardManager.makeItemActivateable(item.node);
          } else {
            CardManager.disableCardActions(item.node);
          }
        }
        //enable playing loot if you havnet already
        if (TurnsManager.currentTurn.lootCardPlays > 0) {
          for (let i = 0; i < currentPlayerComp.handCards.length; i++) {
            const card = currentPlayerComp.handCards[i];
            CardManager.disableCardActions(card);
            CardManager.makeLootPlayable(card, currentPlayerComp);
            CardManager.setOriginalSprites(currentPlayerHandComp.layoutCards);
          }
        } else {
          for (let i = 0; i < currentPlayerComp.handCards.length; i++) {
            const card = currentPlayerComp.handCards[i];
            CardManager.disableCardActions(card);
            CardManager.makeCardPreviewable(card);
          }
        }
        //if its a first attack
        if (BattleManager.firstAttack) {
          //allow rolling of a dice
          player
            .getComponentInChildren(Dice)
            .addRollAction(ROLL_TYPE.FIRSTATTACK);
          //if its not the first attack
        } else {
          player.getComponentInChildren(Dice).addRollAction(ROLL_TYPE.ATTACK);
        }
      }
    }
  }

  static updateActionsForNotTurnPlayer(player: cc.Node) {
    this.decks = CardManager.getAllDecks();
    let lootDeck = CardManager.lootDeck.getComponent(Deck);
    lootDeck.interactive = false;
    //update player reactions:
    player.getComponent(Player).calculateReactions();
    //disable drawing loot
    CardManager.makeDeckNotDrawable(CardManager.lootDeck);
    //disable buying items by removing their draggableComp
    for (let i = 0; i < Store.storeCards.length; i++) {
      const storeCard = Store.storeCards[i];
      CardManager.disableCardActions(storeCard);
      CardManager.makeCardPreviewable(storeCard);
    }
    //make all table cards not moveable but available for preview
    if (CardManager.onTableCards.length != 0) {
      for (let i = 0; i < CardManager.onTableCards.length; i++) {
        const card = CardManager.onTableCards[i];

        CardManager.disableCardActions(card);
        CardManager.makeCardPreviewable(card);
      }
    }
    //disable playing loot
    for (
      let i = 0;
      i < player.getComponent(Player).hand.layoutCards.length;
      i++
    ) {
      const card = player.getComponent(Player).hand.layoutCards[i];
      CardManager.disableCardActions(card);
      CardManager.makeCardPreviewable(card);
    }

    //make other players cards invisible and not moveable
    let otherPlayersHandCards: cc.Node[] = CardManager.getOtherPlayersHandCards(
      player
    );
    if (otherPlayersHandCards.length != 0) {
      for (let i = 0; i < otherPlayersHandCards.length; i++) {
        const card = otherPlayersHandCards[i].getComponent(Card);
        card.node.getComponent(cc.Sprite).spriteFrame = card.backSprite;
        CardManager.disableCardActions(card.node);
      }
    }

    //set up components
    //disable next turn btn
    ButtonManager.nextTurnButton.getComponent(cc.Button).interactable = false;

    //Set up listener to card selected
  }

  static updateActions() {
    cc.log("update actions");
    CardManager.checkForEmptyFields();
    CardManager.updatePlayerCards();
    CardManager.updateOnTableCards();
    CardManager.updatePassiveListeners();

    if (MainScript.currentPlayerNode == PlayerManager.mePlayer) {
      this.updateActionsForTurnPlayer(MainScript.currentPlayerNode);
    } else {
      this.updateActionsForNotTurnPlayer(PlayerManager.mePlayer);
    }
  }

  updateAfterTurnChange() {
    let currentTurnLableComp = cc
      .find("Canvas")
      .getChildByName("current Turn")
      .getComponent(cc.Label);
    //setting current player of the turn.
    MainScript.currentPlayerNode = getCurrentPlayer(
      PlayerManager.players,
      TurnsManager.currentTurn
    );
    MainScript.currentPlayerComp = MainScript.currentPlayerNode.getComponent(
      Player
    );
    //setting turn lable to updated turn
    currentTurnLableComp.string =
      "current turn is:" + TurnsManager.getCurrentTurn().PlayerId;
    ActionManager.updateActions();
  }

  /**
   * do an action and wait for reactions, only for actions that need to get reactions!
   * @param action an action object.
   * @param serverData {signal,srvData}
   */
  //@printMethodStarted(COLORS.PURPLE)
  static async doAction(action: Action, serverData: {}) {
    //show the action to current player
    this.inReactionPhase = true;
    let bool = await action.showAction();
    //show the action to other players.
    action.serverBrodcast(serverData);

    //send to server to get reaction
    //if the action has a card effect that needs to be resolved
    if (action.hasCardEffect) {
      let actionCardServerEffect;
      let passiveIndex;
      let playerId = action.originPlayerId;
      if (action instanceof ActivatePassiveAction) {
        passiveIndex = action.passiveIndex;
        actionCardServerEffect = await CardManager.getCardEffect(
          action.playedCard,
          playerId,
          passiveIndex
        );
      } else {
        actionCardServerEffect = await CardManager.getCardEffect(
          action.playedCard,
          playerId
        );
      }
      //  let playerId = action.originPlayerId;
      this.serverCardEffectStack.push(actionCardServerEffect);
      ActionManager.sendFirstGetReactionToServer(this.serverCardEffectStack);
    } else {
      ActionManager.sendFirstGetReactionToServer();
    }
    //wait for reaction to return a promise of a stack of actions.
    this.updateActions();
    let serverEffectStack: ServerEffect[] = await ActionManager.waitForAllEffects();
    ActionManager.doServerEffects(serverEffectStack);
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  /**
   * Same as do action just without getting reactions of players.
   * @param action
   * @param serverData
   * @param sendToServer
   */
  static async doSingleAction(
    action: Action,
    serverData: {},
    sendToServer: boolean
  ) {
    //show the action to current player
    let bool = await action.showAction();
    if (sendToServer) {
      //show the action to other players.
      action.serverBrodcast(serverData);
    }
    //if the action has a card effect that needs to be resolved
    if (action.hasCardEffect) {
      let playerId = action.originPlayerId;
      let actionCardServerEffect: ServerEffect[] = [
        await CardManager.getCardEffect(action.playedCard, playerId)
      ];
      this.updateActions();
      ActionManager.doServerEffects(actionCardServerEffect);
    }
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
  /**
   *
   * @param action an action to show
   * @param serverData data of which action to show in server.
   * @param sendToServer true if original action.
   */

  static async showSingleAction(
    action: Action,
    serverData: {},
    sendToServer: boolean
  ) {
    //show the action to current player
    let bool = await action.showAction();
    //show the action to other players.
    if (sendToServer) {
      action.serverBrodcast(serverData);
    }
    this.updateActions();
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  static async doServerEffects(serverCardEffectStack: ServerEffect[]) {
    if (
      Array.isArray(serverCardEffectStack) &&
      serverCardEffectStack.length > 0
    ) {
      let currentServerEffect: ServerEffect = serverCardEffectStack.pop();
      let newServerEffectStack = null;

      newServerEffectStack = await CardManager.doCardEffectFromServer(
        currentServerEffect,
        serverCardEffectStack
      );

      if (PassiveManager.inPassivePhase) {
        let passivesOver = await this.waitForPassives();
      }
      this.doServerEffects(newServerEffectStack);
    } else {
      cc.log("check after last effect");
      this.inReactionPhase = false;
    }

    this.updateActions();
  }

  static async waitForPassives(): Promise<boolean> {
    //w8 for a server message with a while,after the message is recived (should be a stack of effects with booleans) resolve with stack of effects.
    return new Promise((resolve, reject) => {
      let check = () => {
        if (PassiveManager.inPassivePhase == false) {
          //  ActionManager.noMoreActionsBool = false;
          resolve(true);
        } else {
          setTimeout(check, 50);
        }
      };
      setTimeout(check, 50);
    });
  }

  static sendGetReactionToNextPlayer(data) {
    Server.$.send(Signal.GETREACTION, data);
  }

  static sendFirstGetReactionToServer(firstActionServerCardEffect?) {
    let noMoreActionsBooleans: boolean[] = [];
    let serverCardEffects: ServerEffect[] = [];

    if (
      firstActionServerCardEffect != null &&
      Array.isArray(firstActionServerCardEffect)
    ) {
      serverCardEffects = serverCardEffects.concat(firstActionServerCardEffect);
    } else {
      if (
        firstActionServerCardEffect != null &&
        !Array.isArray(firstActionServerCardEffect)
      ) {
        serverCardEffects.push(firstActionServerCardEffect);
      }
    }
    for (let i = 0; i < PlayerManager.players.length; i++) {
      noMoreActionsBooleans.push(false);
    }
    let firstReactionData = {
      originalPlayer: MainScript.currentPlayerComp.playerId,
      lastPlayerTakenAction: MainScript.currentPlayerComp.playerId,
      booleans: noMoreActionsBooleans,
      serverCardEffects: serverCardEffects
    };
    Server.$.send(Signal.GETREACTION, firstReactionData);
  }

  static async waitForAllEffects(): Promise<ServerEffect[]> {
    //w8 for a server message with a while,after the message is recived (should be a stack of effects with booleans) resolve with stack of effects.
    return new Promise((resolve, reject) => {
      let check = () => {
        if (ActionManager.noMoreActionsBool == true) {
          ActionManager.noMoreActionsBool = false;
          resolve(ActionManager.serverCardEffectStack);
        } else {
          setTimeout(check, 50);
        }
      };
      setTimeout(check, 50);
    });
  }

  //@printMethodSignal
  static getActionFromServer(signal, data) {
    let player: Player;
    let card;
    let deck;
    switch (signal) {
      //Actions from a player,without reaction
      case Signal.DISCRADLOOT:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId);
        player.discardLoot(card, false);
        ActionManager.updateActions();
        break;
      case Signal.NEWMONSTERONPLACE:
        let monsterField = cc
          .find("Canvas/MonsterDeck/MonsterField")
          .getComponent(MonsterField);
        let newMonster = CardManager.getCardById(data.newMonsterId, true);
        let monsterDeck = CardManager.monsterDeck.getComponent(Deck);
        monsterDeck.cards.splice(monsterDeck.cards.indexOf(newMonster), 1);
        monsterField.addMonsterToExsistingPlace(
          data.monsterPlaceId,
          newMonster,
          false
        );
        break;
      case Signal.SHOWCARDPREVIEW:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardToShowId, true);
        //add a lable with who is selecting.

        CardPreview.$.showCardPreview(card, false, false, false);
        ActionManager.updateActions();
        break;
      case Signal.ACTIVATEITEM:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId);
        player.activateItem(card, false);
        ActionManager.updateActions();
        break;
      case Signal.CARDDRAWED:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        deck = CardManager.getDeckByType(data.deckType);
        player.drawCard(deck, false);
        ActionManager.updateActions();
        break;
      case Signal.ROLLDICE:
        cc.log("begin roll dice animaion");
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        // let numberRolled = data.numberRolled;
        // let rollType = data.rollType;
        player.dice.activateRollAnimation();
        //  player.rollDice(rollType, false, numberRolled);
        break;
      case Signal.ROLLDICEENDED:
        cc.log(" roll dice ended on other side");
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        // let numberRolled = data.numberRolled;
        // let rollType = data.rollType;
        player.dice.endRollAnimation();
        player.dice.setRoll(data.numberRolled);
        //  player.rollDice(rollType, false, numberRolled);
        break;

      case Signal.PLAYLOOTCARD:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId);
        player.playLootCard(card, false);
        ActionManager.updateActions();
        break;
      case Signal.ADDANITEM:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId, true);
        player.buyItem(card, false);
        ActionManager.updateActions();
        break;
      case Signal.DECLAREATTACK:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        let attackedMonster = CardManager.getCardById(data.attackedMonsterId);
        player.declareAttack(attackedMonster, false);
        ActionManager.updateActions();
        break;
      case Signal.NEXTTURN:
        if (MainScript.serverId != data.sentFromPlayerID) {
          TurnsManager.nextTurn(true);
        }
        break;

      //Part of Reaction system. get reaction from a player
      case Signal.GETREACTION:
        this.serverCardEffectStack = data.serverCardEffects;
        if (ActionManager.checkForLastAction(data, false)) {
        } else {
          PlayerManager.mePlayer.getComponent(Player).getReaction(data);
        }
        break;
      case Signal.RESOLVEACTIONS:
        if (
          PlayerManager.mePlayer.getComponent(Player).playerId ==
          TurnsManager.getCurrentTurn().PlayerId
        ) {
          ActionManager.resolveWaitingEffects(data);
        } else {
          ActionManager.resolveOtherPlayerAction(data);
        }
        break;
      case Signal.OTHERPLAYERRESOLVEREACTION:
        break;
      default:
        break;
    }
  }

  static resolveWaitingEffects(data) {
    ActionManager.serverCardEffectStack = data.serverCardEffects;
    ActionManager.noMoreActionsBool = true;
  }

  static resolveOtherPlayerAction(data) {
    this.doServerEffects(data.serverCardEffects);
  }

  /**
   *
   * @param data {originalPlayer:number,lastPlayerTakenAction:number, booleans[], serverCardEffects[]}
   */
  static checkForLastAction(data, isAfterReactionCheck: boolean): boolean {
    //checks if the current player is the last player who did an action, if yes, checks for no more actions.
    if (
      data.lastPlayerTakenAction ==
      PlayerManager.mePlayer.getComponent(Player).playerId
    ) {
      //check if all booleans of no more actions are true.
      let actionsBooleans: boolean[] = data.booleans;
      let boolCounter: number = actionsBooleans.length;
      for (let i = 0; i < actionsBooleans.length; i++) {
        const actionBool = actionsBooleans[i];
        if (actionBool) {
          boolCounter--;
        }
      }
      //if all players does no more actions:
      if (boolCounter == 0) {
        //  ActionManager.serverCardEffectStack = data.serverCardEffects;
        let data2 = {
          originalPlayer: data.originalPlayer,
          serverCardEffects: data.serverCardEffects
        };
        Server.$.send(Signal.RESOLVEACTIONS, data2);
        ActionManager.resolveWaitingEffects(data2);
        // ActionManager.noMoreActionsBool = true;
      } else {
        if (isAfterReactionCheck == false) {
          //get player reaction
          PlayerManager.mePlayer.getComponent(Player).getReaction(data);
        }
      }
      return true;
    } else {
      return false;
    }
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    ActionManager.turnsManager = cc.find("MainScript/TurnsManager");

    ActionManager.playersManager = cc.find("MainScript/PlayerManager");

    ActionManager.cardManager = cc.find("MainScript/CardManager");

    //cc.log(ActionManager.cardManager)

    ActionManager.decks = CardManager.getAllDecks();

    ActionManager.ButtonManager = cc.find("MainScript/ButtonManager");

    ActionManager.pileManager = cc.find("MainScript/PileManager");

    let currentTurnLableComp = cc
      .find("Canvas")
      .getChildByName("current Turn")
      .getComponent(cc.Label);
    let playerManagerComp: PlayerManager = ActionManager.playersManager.getComponent(
      "PlayerManager"
    );
    let turnsManagerComp: TurnsManager = ActionManager.turnsManager.getComponent(
      "TurnsManager"
    );

    // //set up turn change listener
    this.node.parent.on("turnChanged", this.updateAfterTurnChange, this);

    //TODO expand to includ all of the turn plays (buying,fighting,playing loot card)
    //TODO dont forget to exlude all available reactions from all other players when available!
  }

  start() {}

  // update (dt) {}
}
