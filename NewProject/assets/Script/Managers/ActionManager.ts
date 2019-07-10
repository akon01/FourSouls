import Signal from "../../Misc/Signal";
import Server from "../../ServerClient/ServerClient";
import { ROLL_TYPE, ACTION_TYPE, CARD_TYPE, ITEM_TYPE } from "../Constants";
import {
  Action,
  ActivatePassiveAction,
  RollDiceAction
} from "../Entites/Action";
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
import Monster from "../Entites/CardTypes/Monster";
import PileManager from "./PileManager";
import CardEffect from "../Entites/CardEffect";
import RollDice from "../CardEffectComponents/RollDice";
import MonsterCardHolder from "../Entites/MonsterCardHolder";
import PlayLootCard from "../CardEffectComponents/CardEffects/PlayLootCard";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import CardPreviewManager from "./CardPreviewManager";

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
  static serverEffectStack: ServerEffect[] = [];
  static noMoreActionsBool: boolean = false;
  static inReactionPhase: boolean = false;

  //test only!!
  static reactionChainNum: number = 0;

  static lootPlayedInAction(playerId: any, cardId: any) {
    let card: Card = CardManager.getCardById(cardId).getComponent(Card);
  }


  static updateActionsForTurnPlayer(player: cc.Node) {
    this.decks = CardManager.getAllDecks();
    let lootDeck = CardManager.lootDeck.getComponent(Deck);
    let treasureDeck = CardManager.treasureDeck.getComponent(Deck);
    let monsterDeck = CardManager.monsterDeck.getComponent(Deck);
    let monsterTopCard = monsterDeck.topBlankCard;
    //set up components
    var currentPlayerComp: Player = player.getComponent(Player);
    var currentPlayerHand: cc.Node = player.getChildByName("Hand");
    var currentPlayerHandComp: CardLayout = currentPlayerHand.getComponent(
      CardLayout
    );


    cc.log(ActionManager.inReactionPhase)
    cc.log(currentPlayerComp.Hp)
    cc.log(TurnsManager.currentTurn.battlePhase)

    if (!ActionManager.inReactionPhase && currentPlayerComp.Hp > 0) {

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

          if (treasureDeck.topBlankCard != null) {
            let treasureDeckTopCard = treasureDeck.topBlankCard;
            CardManager.makeItemBuyable(treasureDeckTopCard, currentPlayerComp);
          }
        } else {
          for (let i = 0; i < Store.storeCards.length; i++) {
            const storeCard = Store.storeCards[i];
            CardManager.disableCardActions(storeCard);
            CardManager.makeCardPreviewable(storeCard);
          }
          if (treasureDeck.topBlankCard != null) {
            let treasureDeckTopCard = treasureDeck.topBlankCard;
            CardManager.disableCardActions(treasureDeckTopCard);
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
        //make current player loot card playable
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
          if (item.getComponent(CardEffect).testEffectsPreConditions()) {
            cc.log(`${item.name} is activatble`)

            CardManager.makeItemActivateable(item.node);
          } else {
            cc.log(`${item.name} is not activatble`)
            CardManager.disableCardActions(item.node);

          }
        }
        player.getComponentInChildren(Dice).disableRoll();

        //if in battle phase do battle
      } else {

        //if the monster is not dead
        // 
        //enable activating items
        ButtonManager.nextTurnButton.getComponent(cc.Button).interactable = false;
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
    } else {


      ActionManager.inReactionPhase
      ButtonManager.nextTurnButton.getComponent(cc.Button).interactable = false;
    }
    return new Promise((resolve, reject) => {
      resolve(true)
    })
  }


  static updateActionsForNotTurnPlayer(player: cc.Node) {
    this.decks = CardManager.getAllDecks();
    let lootDeck = CardManager.lootDeck.getComponent(Deck);

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
    if (!ActionManager.inReactionPhase) {

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
    return new Promise((resolve, reject) => resolve(true))
  }


  static isUpdateActionsRunning = false;

  static async waitForUpdateActions(): Promise<boolean> {
    //w8 for a server message with a while,after the message is recived (should be a stack of effects with booleans) resolve with stack of effects.
    return new Promise((resolve, reject) => {
      let check = () => {
        if (this.isUpdateActionsRunning == true) {
          resolve(true);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  static async updateActions() {

    if (this.isUpdateActionsRunning) {

      let over = await this.waitForUpdateActions()
    }
    this.isUpdateActionsRunning = true
    await CardManager.checkForEmptyFields();

    await CardManager.updatePlayerCards();

    await CardManager.updateOnTableCards();


    if (MainScript.currentPlayerNode == PlayerManager.mePlayer) {
      await CardManager.updatePassiveListeners();
      await this.updateActionsForTurnPlayer(MainScript.currentPlayerNode);

    } else {
      await this.updateActionsForNotTurnPlayer(PlayerManager.mePlayer);

    }

    this.isUpdateActionsRunning = false

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

  static reactionChainsActive: number[] = [];
  static actionHasCardEffect = false;
  static actionIsPassiveActivate = false;
  static cardEffectToDo: { playedCard: cc.Node, playerId: number, passiveIndex?: number } = null;

  /**
   * do an action and wait for reactions, only for actions that need to get reactions!
   * @param action an action object.
   * @param serverData {signal,srvData}
   */
  @printMethodStarted(COLORS.RED)
  static async doAction(action: Action, serverData: {}) {
    if (this.inReactionPhase && !(action instanceof RollDiceAction)) {
      let bool = await this.waitForReqctionsOver();
    }

    let chainNum = ++this.reactionChainNum
    this.reactionChainsActive.push(chainNum);
    this.inReactionPhase = true;
    //show the action to current player
    //if action is a roll action bol will be the number rolled.
    let bool = await action.showAction();
    //show the action to other players.
    action.serverBrodcast(serverData);

    //send to server to get reaction
    //if the action has a card effect that needs to be resolved
    if (action.hasCardEffect) {

      ActionManager.sendFirstGetReactionToServer();
      ActionManager.noMoreActionsBool = false;
      //wait for reaction to return a promise of a stack of actions.
      let serverEffectStack: ServerEffect[] = await ActionManager.waitForAllEffects();
      this.serverEffectStack = serverEffectStack;
      let actionCardServerEffect
      if (action instanceof ActivatePassiveAction) {
        actionCardServerEffect = await CardManager.getCardEffect(
          action.playedCard,
          action.originPlayerId,
          action.passiveIndex
        );
      } else {
        actionCardServerEffect = await CardManager.getCardEffect(
          action.playedCard,
          action.originPlayerId
        );
      }
      this.serverEffectStack.push(actionCardServerEffect);
      this.sendFirstGetReactionToServer(this.serverEffectStack)
      serverEffectStack = await ActionManager.waitForAllEffects();
      this.serverEffectStack = serverEffectStack;
      let data2 = { originalPlayer: action.originPlayerId, serverCardEffects: this.serverEffectStack }
      Server.$.send(Signal.RESOLVEACTIONS, data2);
      cc.log('do server effects from do action with card effect')
      let serverEffectsOver = await ActionManager.doServerEffects();
      this.updateActions();
      if (this.isReactionChainActive(chainNum)) {

        this.reactionChainsActive.splice(
          this.reactionChainsActive.indexOf(this.reactionChainNum)
        );
      }
      return new Promise((resolve, reject) => {
        resolve(chainNum);
      });
    }
    else {

      ActionManager.sendFirstGetReactionToServer();


      // this.updateActions();
      //wait for reaction to return a promise of a stack of actions. 
      let serverEffectStack: ServerEffect[] = await ActionManager.waitForAllEffects();

      //  this.serverEffectStack = this.serverEffectStack.concat(serverEffectStack);
      this.serverEffectStack = serverEffectStack;
      cc.log('do server effects from do action with-out card effect')
      let serverEffectsOver = await ActionManager.doServerEffects();
      this.updateActions();
      if (this.isReactionChainActive(chainNum)) {

        this.reactionChainsActive.splice(
          this.reactionChainsActive.indexOf(this.reactionChainNum)
        );
      }
      return new Promise((resolve, reject) => {
        resolve(chainNum);
      });
    }
  }


  static waitForSubAction: boolean = false;
  static effectWithSubAction: ServerEffect;
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
    if (this.inReactionPhase) {
      let bool = await this.waitForReqctionsOver();
    }

    let chainNum = ++this.reactionChainNum
    this.reactionChainsActive.push(chainNum);
    this.inReactionPhase = true;
    //show the action to current player
    let bool = await action.showAction();
    if (sendToServer) {
      //show the action to other players.
      action.serverBrodcast(serverData);
    }
    //if the action has a card effect that needs to be resolved
    if (action.hasCardEffect) {
      let actionCardServerEffect: ServerEffect;
      let passiveIndex: number;
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

      this.serverEffectStack.push(actionCardServerEffect);
      //this.updateActions();

      //  this.serverCardEffectStack = actionCardServerEffect;
      cc.log('do server effects from do signle action with card effect')
      let serverEffectsOver = await ActionManager.doServerEffects();
      this.updateActions();
      if (this.isReactionChainActive(chainNum)) {
        this.reactionChainsActive.splice(
          this.reactionChainsActive.indexOf(this.reactionChainNum)
        );
      }
    }
    return new Promise((resolve, reject) => {
      resolve(chainNum);
    });
  }


  static inShowAction = false;
  /**
   *shows an action without checking for a card effect, if send to server will show in all players
   * @param action an action to show
   * @param serverData data of which action to show in server.
   * @param sendToServer true if original action.
   */

  static async showSingleAction(
    action: Action,
    serverData: {},
    sendToServer: boolean
  ) {
    let chainNum = ++this.reactionChainNum
    this.reactionChainsActive.push(chainNum);
    this.inShowAction = true
    //show the action to current player
    let bool = await action.showAction();
    this.inShowAction = false
    //show the action to other players.
    if (sendToServer) {
      action.serverBrodcast(serverData);
    }
    if (this.isReactionChainActive(chainNum)) {
      this.reactionChainsActive.splice(
        this.reactionChainsActive.indexOf(this.reactionChainNum)
      );
    }
    // this.updateActions();
    return new Promise((resolve, reject) => {
      resolve(chainNum);
    });
  }

  @printMethodStarted(COLORS.RED)
  static async doServerEffects() {

    let serverCardEffectStack = this.serverEffectStack;
    if (
      Array.isArray(serverCardEffectStack) &&
      serverCardEffectStack.length > 0
    ) {

      let currentServerEffect: ServerEffect = serverCardEffectStack.pop();
      let newServerEffectStack = null;
      //TODO test if gone!
      if (currentServerEffect.effectName == 'roll') {

        if (serverCardEffectStack.length != 0) throw "imposible state, cant be a roll action not as last action";
        this.inReactionPhase = false;
        return new Promise((resolve, reject) => {
          //will be the number rolled by the action.
          resolve(currentServerEffect.cardEffectNum)
        })
      }
      if (currentServerEffect.effectName != 'AddPassiveEffect') {


        newServerEffectStack = await CardManager.doEffectFromServer(
          currentServerEffect,
          serverCardEffectStack
        );
        this.serverEffectStack = newServerEffectStack;
      } else {

        if (currentServerEffect.cardPlayerId == PlayerManager.mePlayer.getComponent(Player).playerId) {


          await CardManager.doEffectFromServer(
            currentServerEffect,
            serverCardEffectStack
          );
        } else {


        }

        this.serverEffectStack = serverCardEffectStack;
      }
      if (PassiveManager.inPassivePhase) {

        let passivesOver = await this.waitForPassives();

      }
      cc.log('do server effects from do server effects')
      this.doServerEffects();
    } else {


      this.reactionChainsActive.splice(
        this.reactionChainsActive.indexOf(this.reactionChainNum)
      );
      this.inReactionPhase = false;
    }
    this.serverEffectStack = [];
    cc.log('set no more actions bool to false')
    ActionManager.noMoreActionsBool = false;
    // this.updateActions();
    return new Promise((resolve, reject) => {
      resolve(this.reactionChainNum);
    });
  }

  static isReactionChainActive(chainNumber: number): boolean {
    for (const chain of this.reactionChainsActive) {
      if (chain == chainNumber) {

        return true;
      }
    }

    return false;
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
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  static isShowActionOver() {
    return new Promise((resolve, reject) => {
      let check = () => {
        if (!this.inShowAction) {
          //  ActionManager.noMoreActionsBool = false;
          resolve(true);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  static async waitForReqctionsOver(): Promise<boolean> {
    //w8 for a server message with a while,after the message is recived (should be a stack of effects with booleans) resolve with stack of effects.
    return new Promise((resolve, reject) => {
      let check = () => {
        if (ActionManager.inReactionPhase == false) {
          //  ActionManager.noMoreActionsBool = false;
          resolve(true);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
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

  static waitForAllEffectsOn: boolean = false;

  static async waitForAllEffects(): Promise<ServerEffect[]> {
    cc.log(`wait for all effects -> ${ActionManager.noMoreActionsBool}`)
    this.waitForAllEffectsOn = true;
    //w8 for a server message with a while,after the message is recived (should be a stack of effects with booleans) resolve with stack of effects.
    return new Promise((resolve, reject) => {
      let check = () => {
        if (ActionManager.noMoreActionsBool == true) {
          ActionManager.noMoreActionsBool = false;
          this.waitForAllEffectsOn = false;
          cc.log('no more action bool was true, end wait for all effects: ' + ActionManager.noMoreActionsBool)
          resolve(ActionManager.serverEffectStack);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  static inRollAction = false;

  static async waitForRollActionEnd(): Promise<ServerEffect[]> {
    //w8 for a server message with a while,after the message is recived (should be a stack of effects with booleans) resolve with stack of effects.
    return new Promise((resolve, reject) => {
      let check = () => {
        if (ActionManager.inRollAction == true) {
          ActionManager.inRollAction = false;
          resolve(ActionManager.serverEffectStack);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  @printMethodSignal
  static async getActionFromServer(signal, data) {
    let player: Player;
    let card: cc.Node;
    let deck: Deck;
    let monsterHolder: MonsterCardHolder
    let monster: Monster
    let place: cc.Node;
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
        monsterDeck._cards.splice(monsterDeck._cards.indexOf(newMonster), 1);
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

        CardPreviewManager.getPreviews(Array.of(card));
        //  ActionManager.updateActions();
        break;
      case Signal.ACTIVATEITEM:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId);
        let itemActivated = await player.activateItem(card, false);

        //  ActionManager.updateActions();
        break;

      case Signal.ROLLDICE:

        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        // let numberRolled = data.numberRolled;
        // let rollType = data.rollType;
        player.dice.activateRollAnimation();
        //  player.rollDice(rollType, false, numberRolled);
        break;
      case Signal.ROLLDICEENDED:

        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        player.dice.endRollAnimation();
        player.dice.setRoll(data.numberRolled);

        break;

      case Signal.MOVECARD:
        card = CardManager.getCardById(data.cardId, true)
        place = PlayerManager.getPlayerById(data.placeID)
        if (place != null) {
          place = place.getComponent(Player).hand.node;
        }
        if (place == null) {
          place = CardManager.getCardById(data.placeID, true)
        }
        CardManager.moveCardTo(card, place, false, data.moveIndex, data.firstPos)
        break;
      case Signal.MOVECARDEND:
        CardManager.reciveMoveCardEnd(data.moveIndex)
        break;

      case Signal.NEXTTURN:
        ActionManager.inReactionPhase = false;
        let currentTurnPlayer = PlayerManager.getPlayerById(
          TurnsManager.getCurrentTurn().PlayerId
        );
        currentTurnPlayer.getComponent(Player).endTurn(false);
        break;
      case Signal.MOVECARDTOPILE:
        card = CardManager.getCardById(data.cardId, true);
        PileManager.addCardToPile(data.type, card, false);
        break;
      case Signal.GETSOUL:
        card = CardManager.getCardById(data.cardId, true);
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        player.getSoulCard(card, false)
        break;

      //On Monster Events
      case Signal.MONSTERGETDAMAGED:
        monster = CardManager.getCardById(data.cardId, true).getComponent(Monster);
        await monster.getDamaged(data.damage, false)
        break;
      case Signal.MONSTERGAINHP:
        monster = CardManager.getCardById(data.cardId, true).getComponent(Monster);
        await monster.gainHp(data.hpToGain, false)
        break;

      case Signal.MONSTERGAINDMG:
        monster = CardManager.getCardById(data.cardId, true).getComponent(Monster);
        await monster.gainDMG(data.DMGToGain, false)
        break;
      case Signal.MONSTERGAINROLLBONUS:
        monster = CardManager.getCardById(data.cardId, true).getComponent(Monster);
        await monster.gainRollBonus(data.bonusToGain, false)
        break;

      //Monster holder actions
      case Signal.GETNEXTMONSTER:
        monsterHolder = MonsterField.getMonsterPlaceById(data.holderId);
        monsterHolder.getNextMonster(false);
        break;
      case Signal.ADDMONSTER:

        monsterHolder = MonsterField.getMonsterPlaceById(data.holderId);

        card = CardManager.getCardById(data.monsterId, true)
        monsterHolder.addToMonsters(card, false);
        break;
      case Signal.REMOVEMONSTER:
        monsterHolder = MonsterField.getMonsterPlaceById(data.holderId);
        card = CardManager.getCardById(data.monsterId, true)
        monsterHolder.removeMonster(card, false);
        break;

      // Deck actions
      case Signal.CARDDRAWED:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.drawnCardId, true)
        deck = CardManager.getDeckByType(data.deckType).getComponent(Deck);
        player.drawCard(deck.node, false, card);
        //  ActionManager.updateActions();
        break;
      case Signal.DECKADDTOTOP:
        deck = CardManager.getDeckByType(data.deckType).getComponent(Deck)
        card = CardManager.getCardById(data.cardId, true)
        deck.addToDeckOnTop(card, false)
        break;
      case Signal.DRAWCARD:
        deck = CardManager.getDeckByType(data.deckType).getComponent(Deck)
        deck.drawCard(false)
        break;
      case Signal.ADDSTORECARD:
        card = CardManager.getCardById(data.cardId, true)
        Store.$.addStoreCard(false, card);

        break;


      // OnPlayer actions

      case Signal.PLAYLOOTCARD:

        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId, true);
        player.playLootCard(card, false);
        break;
      case Signal.PLAYLOOTCARD:

        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId, true);
        player.loseLoot(card, false);
        break;
      case Signal.ADDANITEM:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId, true);
        if (data.isReward) {
          player.addItem(card, false, true);
        } else {
          player.buyItem(card, false);
          break;
        }
      case Signal.PLAYERRECHARGEITEM:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId, true);
        player.rechargeItem(card, false);
        break;

      case Signal.DECLAREATTACK:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        let attackedMonster = CardManager.getCardById(
          data.attackedMonsterId,
          true
        );
        ;
        player.declareAttack(attackedMonster, false, data.cardHolderId);
        // ActionManager.updateActions();
        break;


      case Signal.CHANGEMONEY:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        player.changeMoney(data.numOfCoins, false)
        break;


      case Signal.SETMONEY:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        player.setMoney(data.numOfCoins, false)
        break;


      case Signal.PLAYERGAINHP:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.gainHp(data.hpToGain, false)
        break;

      case Signal.PLAYERGAINDMG:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.gainDMG(data.DMGToGain, false)
        break;

      case Signal.PLAYERGAINROLLBONUS:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.gainRollBonus(data.bonusToGain, false)
        break;

      case Signal.PLAYERGAINATTACKROLLBONUS:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.gainAttackRollBonus(data.bonusToGain, false)
        break;

      case Signal.PLAYERGAINFIRSTATTACKROLLBONUS:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.gainFirstAttackRollBonus(data.bonusToGain, false)
        break;

      case Signal.PLAYERGETHIT:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.getHit(data.damage, false)
        break;


      //PassiveManager actions.
      case Signal.REGISTERPASSIVEITEM:
        card = CardManager.getCardById(data.cardId)
        PassiveManager.registerPassiveItem(card, false);
        break;

      case Signal.REGISTERONETURNPASSIVEEFFECT:
        card = CardManager.getCardById(data.cardId);
        let cardEffect = card.getComponent(CardEffect).toAddPassiveEffects[data.effectIndex].getComponent(Effect)
        cardEffect.condition.conditionData = data.conditionData;
        PassiveManager.registerOneTurnPassiveEffect(cardEffect, false)
        break;

      //Part of Reaction system. get reaction from a player
      case Signal.ENDROLLACTION:
        ActionManager.inReactionPhase = false;
        break;


      case Signal.GETREACTION:
        this.serverEffectStack = data.serverCardEffects;
        if (this.inShowAction) {
          await this.isShowActionOver()
        }
        if (ActionManager.checkForLastAction(data, false)) {
        } else {


          this.inReactionPhase = true;
          PlayerManager.mePlayer.getComponent(Player).getReaction(data);
        }
        //}
        //add a check for if your! card effect collector has a subAction and if they do, do it and dont do this!
        break;
      case Signal.RESOLVEACTIONS:
        if (
          PlayerManager.mePlayer.getComponent(Player).playerId ==
          TurnsManager.currentTurn.PlayerId
        ) {

          ActionManager.resolveWaitingEffects(data);
        } else {

          this.inReactionPhase = false;
          ActionManager.resolveOtherPlayerAction(data);
        }
        break;
      case Signal.ACTIVATEPASSIVE:
        let cardActivated = CardManager.getCardById(data.cardId);
        let passiveIndex = data.passiveIndex;
        let cardActivator = CardManager.getCardById(data.cardActivator);
        if (cardActivator == null) {
          let playerActivator = PlayerManager.getPlayerByCardId(
            data.cardActivator
          );
          playerActivator.activatePassive(cardActivated, false, passiveIndex);
        } else {

        }

        break;
      default:
        break;
    }
    this.updateActions()
  }


  static resolveWaitingEffects(data) {
    ActionManager.serverEffectStack = data.serverCardEffects;
    if (this.waitForAllEffectsOn) {
      cc.log('end wait for all effects')
      ActionManager.noMoreActionsBool = true;
    } else cc.log('no wait for effect is on.')
  }


  static resolveWaitingRollAction(data) {
    ActionManager.serverEffectStack = data.serverCardEffects;
    ActionManager.inRollAction = true;
  }

  //@printMethodStarted(COLORS.RED)
  static async resolveOtherPlayerAction(data) {
    this.serverEffectStack = data.serverCardEffects;
    // let serverEffectsOver = await ActionManager.doServerEffects();
  }

  /**
   *
   * @param data {originalPlayer:number,lastPlayerTakenAction:number, booleans[], serverCardEffects[]}
   */
  static checkForLastAction(data, isAfterReactionCheck: boolean, isRollAction?: boolean): boolean {
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

        if (isRollAction == undefined) {

          // Server.$.send(Signal.RESOLVEACTIONS, data2);

          ActionManager.resolveWaitingEffects(data2);
        } else {
          ActionManager.resolveWaitingRollAction(data2);
          Server.$.send(Signal.ENDROLLACTION, {});
        }
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

  start() { }

  // update (dt) {}
}
