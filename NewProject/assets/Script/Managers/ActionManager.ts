import { ANIM_COLORS } from "./Animation Manager";

import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import AddTrinketOrCurse from "../CardEffectComponents/CardEffects/AddTrinket";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import { BUTTON_STATE, GAME_EVENTS, ROLL_TYPE } from "../Constants";
import ActionMessage from "../Entites/Action Message";
import CardEffect from "../Entites/CardEffect";
import { CardLayout } from "../Entites/CardLayout";
import Item from "../Entites/CardTypes/Item";
import Monster from "../Entites/CardTypes/Monster";
import Card from "../Entites/GameEntities/Card";
import Deck from "../Entites/GameEntities/Deck";
import Dice from "../Entites/GameEntities/Dice";
import Player from "../Entites/GameEntities/Player";
import Store from "../Entites/GameEntities/Store";
import { Logger } from "../Entites/Logger";
import MonsterCardHolder from "../Entites/MonsterCardHolder";
import MonsterField from "../Entites/MonsterField";
import Stack from "../Entites/Stack";
import ActionLable from "../LableScripts/Action Lable";
import StackLable from "../LableScripts/StackLable";
import MainScript from "../MainScript";
import { Turn } from "../Modules/TurnsModule";
import ServerStackEffectConverter from "../StackEffects/ServerSideStackEffects/ServerStackEffectConverter";
import { ServerEffect } from "./../Entites/ServerCardEffect";
import BattleManager from "./BattleManager";
import ButtonManager from "./ButtonManager";
import CardManager from "./CardManager";
import CardPreviewManager from "./CardPreviewManager";
import DataInterpreter, { } from "./DataInterpreter";
import ParticleManager from "./ParticleManager";
import PassiveManager, { ServerPassiveMeta } from "./PassiveManager";
import PileManager from "./PileManager";
import PlayerManager from "./PlayerManager";
import StackEffectVisManager from "./StackEffectVisManager";
import TurnsManager from "./TurnsManager";
import { CardSet } from "../Entites/Card Set";
import DecisionMarker from "../Entites/Decision Marker";
import StackEffectConcrete from "../StackEffects/StackEffectConcrete";
import AttackRoll from "../StackEffects/Attack Roll";
import RollDiceStackEffect from "../StackEffects/Roll DIce";
import SoundManager from "./SoundManager";
import AnimationManager from "./Animation Manager";
import AnnouncementLable from "../LableScripts/Announcement Lable";
import { whevent } from "../../ServerClient/whevent";

const { ccclass } = cc._decorator;

enum CARD_ACTIONS {
  ATTACKABLE, BUYABLE, ACTIVATEABLE, PLAYABLE
}

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
  static serverEffectStack: ServerEffect[] = [];
  static noMoreActionsBool: boolean = false;
  static inReactionPhase: boolean = false;

  // test only!!
  static reactionChainNum: number = 0;

  static lootPlayedInAction(cardId: any) {
  }

  static updateCardAction(card: cc.Node, action: CARD_ACTIONS) {
    CardManager.disableCardActions(card);
    try {
      switch (action) {
        case CARD_ACTIONS.ACTIVATEABLE:
          CardManager.makeItemActivateable(card);
          break;
        case CARD_ACTIONS.ATTACKABLE:
          CardManager.makeMonsterAttackable(card);
          break;
        case CARD_ACTIONS.BUYABLE:
          CardManager.makeItemBuyable(card);
          break;
        case CARD_ACTIONS.PLAYABLE:
          CardManager.makeLootPlayable(card);
          break;
        default:
          break;
      }
    } catch (error) {
      Logger.error(error)
    }
  }

  static disableCardActionsAndMake(card: cc.Node) {
    CardManager.disableCardActions(card);
    CardManager.makeCardPreviewable(card)
  }

  static updateActionsForTurnPlayer(playerNode: cc.Node) {
    this.decks = CardManager.getAllDecks();
    const treasureDeck = CardManager.treasureDeck.getComponent(Deck);
    const monsterDeck = CardManager.monsterDeck.getComponent(Deck);
    // const monsterTopCard = monsterDeck.topBlankCard;
    // set up components
    const player: Player = playerNode.getComponent(Player);
    const currentPlayerHand: cc.Node = player.hand.node
    const currentPlayerHandComp: CardLayout = currentPlayerHand.getComponent(
      CardLayout,
    );
    const allFlippedCards = CardManager.allCards.filter(card => (!card.getComponent(Card)._isFlipped));

    cc.log(`attack plays: ${player.attackPlays}`)
    cc.log(`buy plays: ${player.buyPlays}`)
    cc.log(`loot plays ${player.lootCardPlays}`)
    cc.log("in Battle Phase:" + TurnsManager.currentTurn.battlePhase)

    //if the stack is empty and the player hp is above 0
    if (Stack._currentStack.length == 0 && player._Hp > 0) {

      //if the player doesnt have must attack mosnter/deck , let him skip turn 
      if (player._mustAttackPlays <= 0 && player._mustDeckAttackPlays <= 0) {
        // make next turn btn available
        ButtonManager.enableButton(ButtonManager.$.nextTurnButton, BUTTON_STATE.ENABLED)
      }

      // update player available reactions
      player.calculateReactions();

      // make all table cards not moveable but available for preview
      if (CardManager.allCards.length != 0) {
        for (let i = 0; i < allFlippedCards.length; i++) {
          const card = allFlippedCards[i]
          CardManager.disableCardActions(card);
          CardManager.makeCardPreviewable(card);
        }
      }

      // if not in battle phase allow other actions (buying,playing turnLoot,activating items,attacking a monster)
      if (!TurnsManager.currentTurn.battlePhase || Stack._currentStack.length > 0) {
        // make store cards buyable (add check for money)
        ActionManager.decideForBuyable(playerNode, treasureDeck);

        // make monster cards attackable
        ActionManager.decideForAttackable(monsterDeck);
        // make current player loot card playable
        ActionManager.DecideForPlayable(currentPlayerHandComp);
        // if Items are charged make them playable
        ActionManager.decideForActivateable(playerNode);
        playerNode.getComponent(Player).dice.getComponent(Dice).disableRoll();

        // if in battle phase do battle
      } else if (TurnsManager.currentTurn.battlePhase) {
        cc.log(`in battle phase do battle`)

        const monsters = [...MonsterField.activeMonsters, monsterDeck.node]
        monsters.forEach(monster => {
          this.disableCardActionsAndMake(monster)
        });
        //Disable Next Turn Button if the monster is not dead
        ButtonManager.enableButton(ButtonManager.$.nextTurnButton, BUTTON_STATE.DISABLED)

        // enable activating items
        if (BattleManager.currentlyAttackedMonster.currentHp > 0) {
          this.decideForActivateable(playerNode)
          // enable playing loot if you havnet already
          this.DecideForPlayable(currentPlayerHandComp)
          // if its a first attack
          if (BattleManager.firstAttack) {
            // allow rolling of a dice
            playerNode.getComponent(Player).dice.addRollAction(ROLL_TYPE.FIRST_ATTACK);
            // if its not the first attack
          } else {
            playerNode.getComponent(Player).dice.addRollAction(ROLL_TYPE.ATTACK);
          }

        } else {
          Logger.error(`currently attacked monster has 0 hp,should not happen, should not be in combat`)
          ButtonManager.enableButton(ButtonManager.$.nextTurnButton, BUTTON_STATE.DISABLED)

        }
      } else {
        ButtonManager.enableButton(ButtonManager.$.nextTurnButton, BUTTON_STATE.DISABLED)
      }
    }
  }

  private static decideForBuyable(player: cc.Node, treasureDeck: Deck) {
    const turnPlayer = TurnsManager.currentTurn.getTurnPlayer();
    if (turnPlayer.buyPlays > 0) {
      for (let i = 0; i < Store.storeCards.length; i++) {
        const storeCard = Store.storeCards[i];
        if (player.getComponent(Player).coins >= player.getComponent(Player).getStoreCost()) {
          this.updateCardAction(storeCard, CARD_ACTIONS.BUYABLE);
          //     CardManager.makeItemBuyable(storeCard);
        } else {
          this.disableCardActionsAndMake(storeCard);
          AnimationManager.$.endAnimation(storeCard);
        }
      }

      if (player.getComponent(Player).coins >= Store.topCardCost) {
        this.updateCardAction(treasureDeck.node, CARD_ACTIONS.BUYABLE);
      } else {
        this.disableCardActionsAndMake(treasureDeck.node);
        AnimationManager.$.endAnimation(treasureDeck.node);
      }
    } else {
      for (let i = 0; i < Store.storeCards.length; i++) {
        const storeCard = Store.storeCards[i];
        this.disableCardActionsAndMake(storeCard);
        AnimationManager.$.endAnimation(storeCard);
      }
      this.disableCardActionsAndMake(treasureDeck.node);
      AnimationManager.$.endAnimation(treasureDeck.node);
    }
  }

  private static decideForAttackable(monsterDeck: Deck) {
    const monsters = [...MonsterField.activeMonsters, monsterDeck.node]
    const turnPlayer = TurnsManager.currentTurn.getTurnPlayer();
    if (turnPlayer.attackPlays > 0 || turnPlayer._mustAttackPlays > 0) {
      for (let i = 0; i < monsters.length; i++) {
        const activeMonster = monsters[i];
        this.updateCardAction(activeMonster, CARD_ACTIONS.ATTACKABLE);
      }
    } else {
      for (let i = 0; i < monsters.length; i++) {
        const activeMonster = monsters[i];
        this.disableCardActionsAndMake(activeMonster);
      }
    }
    if (turnPlayer._mustDeckAttackPlays > 0 || turnPlayer._attackDeckPlays > 0) {
      this.updateCardAction(monsterDeck.node, CARD_ACTIONS.ATTACKABLE);
    }
  }

  private static DecideForPlayable(currentPlayerHandComp: CardLayout) {
    const turnPlayer = TurnsManager.currentTurn.getTurnPlayer();
    if (turnPlayer.lootCardPlays > 0) {
      CardManager.setOriginalSprites(currentPlayerHandComp.layoutCards);
      for (let i = 0; i < currentPlayerHandComp.layoutCards.length; i++) {
        const card = currentPlayerHandComp.layoutCards[i];
        this.updateCardAction(card, CARD_ACTIONS.PLAYABLE);
      }
    } else {
      for (let i = 0; i < currentPlayerHandComp.layoutCards.length; i++) {
        const card = currentPlayerHandComp.layoutCards[i];
        this.disableCardActionsAndMake(card);
      }
    }
  }

  private static decideForActivateable(player: cc.Node) {
    const activeItems = player.getComponent(Player).activeItems;
    for (let i = 0; i < activeItems.length; i++) {
      const item = activeItems[i].getComponent(Item);
      if (item.needsRecharge == false) {
        this.updateCardAction(item.node, CARD_ACTIONS.ACTIVATEABLE);
      } else {
        this.disableCardActionsAndMake(item.node);
      }
    }
    const paidItems = player.getComponent(Player).paidItems
    for (let i = 0; i < paidItems.length; i++) {
      const item = paidItems[i].getComponent(Item);
      this.updateCardAction(item.node, CARD_ACTIONS.ACTIVATEABLE);
    }
  }

  static updateActionsForNotTurnPlayer(player: cc.Node) {
    this.decks = CardManager.getAllDecks();
    const turnPlayer = TurnsManager.getCurrentTurn().getTurnPlayer()
    const playerComp = player.getComponent(Player);
    //show current turn player ////currently flashing, think of something smarter

    // update player reactions:
    playerComp.calculateReactions();
    playerComp.dice.getComponent(Dice).disableRoll();

    // if (!ActionManager.inReactionPhase) {
    const allFlippedCards = new Set([
      ...CardManager.allCards.filter(card => !card.getComponent(Card)._isFlipped),
      CardManager.treasureDeck,
      CardManager.monsterDeck,
      ...playerComp.hand.layoutCards,
      ...playerComp.activeItems,
      ...playerComp.passiveItems,
      ...playerComp.paidItems]);
    // make all table cards available for preview
    if (allFlippedCards.size != 0) {
      allFlippedCards.forEach(card => {
        this.disableCardActionsAndMake(card)
        AnimationManager.$.endAnimation(card)
      }
      )
    }
    if (player != turnPlayer.node) {
      AnimationManager.$.showAnimation(turnPlayer.character, ANIM_COLORS.WHITE)
    }
    // make other players cards invisible and not moveable
    const otherPlayersHandCards: cc.Node[] = CardManager.getOtherPlayersHandCards(
      player,
    );
    if (otherPlayersHandCards.length != 0) {
      for (let i = 0; i < otherPlayersHandCards.length; i++) {
        const card = otherPlayersHandCards[i].getComponent(Card);
        if (!card._isFlipped) { card.flipCard(false) }
        this.disableCardActionsAndMake(card.node)
      }
    }

    // set up components
    // disable next turn btn
    ButtonManager.enableButton(ButtonManager.$.nextTurnButton, BUTTON_STATE.DISABLED)

    // Set up listener to card selected
    return true
    //  }
  }

  static checkingForDeadEntities: boolean = false;

  static waitForCheckingDeadEntities() {
    return new Promise((resolve) => {
      whevent.onOnce(GAME_EVENTS.CHECK_FOR_DEAD_ENTITIES, () => {
        resolve();
      })
    });
  }

  static async checkForDeadEntities() {
    if (ActionManager.checkingForDeadEntities) { return }
    ActionManager.checkingForDeadEntities = true
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const player = PlayerManager.players[i].getComponent(Player);
      if (player._Hp == 0 && !player._isDead) {
        await player.killPlayer(true, player._killer)
        player._killer = null;
      }
    }
    for (let i = 0; i < MonsterField.activeMonsters.length; i++) {
      const activeMonster = MonsterField.activeMonsters[i].getComponent(Monster);
      if (activeMonster.currentHp == 0 && !activeMonster._isDead) {
        await activeMonster.kill(activeMonster.killer)
        activeMonster.killer = null;
      }
    }
    ActionManager.checkingForDeadEntities = false
    whevent.emit(GAME_EVENTS.CHECK_FOR_DEAD_ENTITIES)
  }

  static isUpdateActionsRunning = false;

  static async updateActions() {

    // await CardManager.updatePlayerCards();

    await CardManager.updateOnTableCards();

    // await CardManager.checkForEmptyFields();

    if (TurnsManager.getCurrentTurn().getTurnPlayer().playerId == PlayerManager.mePlayer.getComponent(Player).playerId) {

      // await CardManager.updatePassiveListeners();

      await this.updateActionsForTurnPlayer(TurnsManager.getCurrentTurn().getTurnPlayer().node);

    } else {

      await this.updateActionsForNotTurnPlayer(PlayerManager.mePlayer);

    }

  }

  // async updateAfterTurnChange() {
  //   const currentTurnLableComp = cc
  //     .find("Canvas")
  //     .getChildByName("current Turn")
  //     .getComponent(cc.Label);
  //   // setting current player of the turn.
  //   MainScript.currentPlayerNode = getCurrentPlayer(
  //     PlayerManager.players,
  //     TurnsManager.currentTurn,
  //   );
  //   MainScript.currentPlayerComp = MainScript.currentPlayerNode.getComponent(
  //     Player,
  //   );
  //   // setting turn lable to updated turn
  //   currentTurnLableComp.string =
  //     "current turn is:" + TurnsManager.getCurrentTurn().PlayerId;
  //   await ActionManager.updateActions();
  // }

  static cardEffectToDo: { playedCard: cc.Node, playerId: number, passiveIndex?: number } = null;

  static waitForAllEffectsOn: boolean = false;

  static inRollAction = false;

  static async getActionFromServer(signal, data) {
    Logger.printMethodSignal([signal, data], false)
    let player: Player;
    let card: cc.Node;
    let deck: Deck;
    let monsterHolder: MonsterCardHolder
    let monster: Monster
    let place: cc.Node;
    let stackEffect: StackEffectConcrete
    let converter = new ServerStackEffectConverter();
    const cards = new CardSet()
    switch (signal) {
      case Signal.END_GAME:
        MainScript.endGame(data.playerId, false)
        break;
      case Signal.GAME_HAS_STARTED:
        SoundManager.$.setBGVolume(0.5)
        SoundManager.$.playBGMusic(SoundManager.$.BasicBGMusic)
        MainScript.gameHasStarted = true
        break;
      case Signal.DISCARD_LOOT:
        player = PlayerManager.getPlayerById(data.playerId)
        card = CardManager.getCardById(data.cardId, true);
        await player.discardLoot(card, false);
        // ActionManager.updateActions();
        break;
      case Signal.NEW_MONSTER_ON_PLACE:
        const newMonster = CardManager.getCardById(data.cardId, true);
        const monsterDeck = CardManager.monsterDeck.getComponent(Deck);
        const monsterIndex = monsterDeck._cards.indexOf(newMonster)
        if (monsterIndex != -1) {
          monsterDeck._cards.splice(monsterIndex, 1);
        }
        await MonsterField.addMonsterToExsistingPlace(data.monsterPlaceId, newMonster, false);
        break;
      case Signal.SHOW_CARD_PREVIEW:
        player = PlayerManager.getPlayerById(data.playerId)
        card = CardManager.getCardById(data.cardToShowId, true);
        // add a lable with who is selecting.
        await CardPreviewManager.getPreviews(Array.of(card), true);
        break;
      case Signal.ACTIVATE_ITEM:
        player = PlayerManager.getPlayerById(data.playerId)
        card = CardManager.getCardById(data.cardId);
        cc.log(`should not happen`)
        //  let itemActivated = await player.activateItem(card, false);
        break;
      case Signal.ROLL_DICE:
        player = PlayerManager.getPlayerById(data.playerId)
        player.dice.activateRollAnimation();
        break;
      case Signal.ROLL_DICE_ENDED:

        player = PlayerManager.getPlayerById(data.playerId)
        player.dice.endRollAnimation();
        player.dice.setRoll(data.numberRolled);
        break;
      case Signal.MOVE_CARD:
        card = CardManager.getCardById(data.cardId, true)
        switch (data.placeType) {
          case `Hand`:
            place = PlayerManager.getPlayerById(data.placeID).hand.node
            break;
          case `Desk`:
            place = PlayerManager.getPlayerById(data.placeID).desk.node
          case `soulsLayout`:
            place = PlayerManager.getPlayerById(data.placeID).desk.soulsLayout
            break
          case `Card`:
            place = CardManager.getCardById(data.placeID, true)
            break;
          default:
            break;
        }
        await CardManager.moveCardTo(card, place, false, data.flipIfFlipped, data.moveIndex, data.firstPos, data.playerId)
        break;
      case Signal.SOUL_CARD_MOVE_END:
        whevent.emit(GAME_EVENTS.SOUL_CARD_MOVE_END)
        break;
      case Signal.USE_ITEM:
        card = CardManager.getCardById(data.cardId)
        card.getComponent(Item).useItem(false)
        break;
      case Signal.RECHARGE_ITEM:
        card = CardManager.getCardById(data.cardId)
        card.getComponent(Item).rechargeItem(false)
        break;
      case Signal.MOVE_CARD_END:
        CardManager.receiveMoveCardEnd(data.moveIndex)
        break;

      case Signal.NEXT_TURN:
        ActionManager.inReactionPhase = false;
        const currentTurnPlayer = PlayerManager.getPlayerById(
          TurnsManager.getCurrentTurn().PlayerId,
        );
        await currentTurnPlayer.getComponent(Player).endTurn(false);
        break;
      case Signal.END_TURN:
        await TurnsManager.endTurn(false)
        break;
      case Signal.MOVE_CARD_TO_PILE:
        card = CardManager.getCardById(data.cardId, true);
        await PileManager.addCardToPile(data.type, card, false);
        break;
      case Signal.REMOVE_FROM_PILE:
        card = CardManager.getCardById(data.cardId, true);
        await PileManager.removeFromPile(card, false);
        break;
      case Signal.GET_SOUL:
        card = CardManager.getCardById(data.cardId, true);
        player = PlayerManager.getPlayerById(data.playerId)
        await player.getSoulCard(card, false)
        card.setParent(player.soulsLayout)
        card.setPosition(0, 0)
        break;
      case Signal.LOSE_SOUL:
        card = CardManager.getCardById(data.cardId, true);
        player = PlayerManager.getPlayerById(data.playerId)
        await player.loseSoul(card, false)
        break;
      // On Monster Events
      case Signal.MONSTER_GET_DAMAGED:
        monster = CardManager.getCardById(data.cardId, true).getComponent(Monster);
        let damageDealer = CardManager.getCardById(data.damageDealerId)
        monster.currentHp = data.hpLeft
        // await monster.getDamaged(data.damage, false, damageDealer)
        break;
      case Signal.MONSTER_GAIN_HP:
        monster = CardManager.getCardById(data.cardId, true).getComponent(Monster);
        await monster.gainHp(data.hpToGain, false)
        break;

      case Signal.MONSTER_GAIN_DMG:
        monster = CardManager.getCardById(data.cardId, true).getComponent(Monster);
        await monster.gainDMG(data.DMGToGain, false)
        break;
      case Signal.MONSTER_GAIN_ROLL_BONUS:
        monster = CardManager.getCardById(data.cardId, true).getComponent(Monster);
        await monster.gainRollBonus(data.bonusToGain, false)
        break;
      case Signal.MONSTER_HEAL:
        monster = CardManager.getCardById(data.cardId, true).getComponent(Monster);
        await monster.heal(data.hpToGain, false)
        break;
      case Signal.MONSTER_ADD_DMG_PREVENTION:
        monster = CardManager.getCardById(data.cardId, true).getComponent(Monster);
        await monster.addDamagePrevention(data.dmgToPrevent, false)
        break;

      // Monster holder actions
      case Signal.GET_NEXT_MONSTER:
        monsterHolder = MonsterField.getMonsterPlaceById(data.monsterPlaceId);
        await monsterHolder.getNextMonster(false);
        break;
      case Signal.ADD_MONSTER:
        monsterHolder = MonsterField.getMonsterPlaceById(data.monsterPlaceId);
        card = CardManager.getCardById(data.monsterId, true)
        await monsterHolder.addToMonsters(card, false);
        break;
      case Signal.REMOVE_MONSTER:
        monsterHolder = MonsterField.getMonsterPlaceById(data.holderId);
        card = CardManager.getCardById(data.monsterId, true)
        await monsterHolder.removeMonster(card, false);
        break;

      // Deck actions
      case Signal.CARD_DRAWN:
        player = PlayerManager.getPlayerById(data.playerId)
        card = CardManager.getCardById(data.drawnCardId, true)
        deck = CardManager.getDeckByType(data.deckType).getComponent(Deck);
        await player.drawCard(deck.node, false, card);
        break;
      case Signal.DECK_ADD_TO_TOP:
        deck = CardManager.getDeckByType(data.deckType).getComponent(Deck)
        card = CardManager.getCardById(data.cardId, true)
        deck.addToDeckOnTop(card, false)
        break;
      case Signal.DECK_ADD_TO_BOTTOM:
        deck = CardManager.getDeckByType(data.deckType).getComponent(Deck)
        card = CardManager.getCardById(data.cardId, true)
        deck.addToDeckOnBottom(card, false)
        break;
      case Signal.DRAW_CARD:
        deck = CardManager.getDeckByType(data.deckType).getComponent(Deck)
        deck.drawCard(false)
        break;
      case Signal.ADD_STORE_CARD:
        card = CardManager.getCardById(data.cardId, true)
        Store.$.addStoreCard(false, card);
        break;
      case Signal.SET_MAX_ITEMS_STORE:
        await Store.addMaxNumOfItems(data.number, false);
        break;
      case Signal.REMOVE_ITEM_FROM_SHOP:
        card = CardManager.getCardById(data.cardId, true)
        await Store.$.removeFromStore(card, false);
        break;

      // OnPlayer actions

      case Signal.PLAY_LOOT_CARD:
        player = PlayerManager.getPlayerById(data.playerId)
        card = CardManager.getCardById(data.cardId, true);
        await player.playLootCard(card, false);
        break;
      case Signal.CARD_ADD_TRINKET:
        player = PlayerManager.getPlayerById(data.playerId)
        card = CardManager.getCardById(data.cardId)
        const addTrinketEffect = card.getComponent(CardEffect).activeEffects[0].getComponent(AddTrinketOrCurse)
        addTrinketEffect.removeAddTrinketEffect()
        break;
      case Signal.ADD_AN_ITEM:
        player = PlayerManager.getPlayerById(data.playerId)
        card = CardManager.getCardById(data.cardId, true);
        await player.addItem(card, false, data.isReward);
        break;
      case Signal.DECLARE_ATTACK:
        const attackedMonster = CardManager.getCardById(
          data.attackedMonsterId,
          true,
        );
        await BattleManager.declareAttackOnMonster(attackedMonster, false)
        break;
      case Signal.PLAYER_PROP_UPDATE:
        player = PlayerManager.getPlayerById(data.playerId)
        player.updateProperties(data.properties)
        break;
      case Signal.PLAYER_GET_LOOT:
        player = PlayerManager.getPlayerById(data.playerId)
        card = CardManager.getCardById(data.cardId, true);
        await player.gainLoot(card, false)
        break;
      case Signal.PLAYER_LOSE_LOOT:
        player = PlayerManager.getPlayerById(data.playerId)
        card = CardManager.getCardById(data.cardId, true);
        await player.loseLoot(card, false)
        break;
      case Signal.CHANGE_MONEY:
        player = PlayerManager.getPlayerById(data.playerId)
        await player.changeMoney(data.numOfCoins, false, data.isStartGame)
        break;
      case Signal.SET_MONEY:
        player = PlayerManager.getPlayerById(data.playerId)
        player.setMoney(data.numOfCoins, false)
        break;
      case Signal.PLAYER_GAIN_HP:
        player = PlayerManager.getPlayerById(data.playerId)
        await player.gainHeartContainer(data.hpToGain, data.isTemp, false)
        break;
      case Signal.PLAYER_GAIN_DMG:
        player = PlayerManager.getPlayerById(data.playerId)
        await player.gainDMG(data.DMGToGain, data.isTemp, false)
        break;
      case Signal.PLAYER_GAIN_ROLL_BONUS:
        player = PlayerManager.getPlayerById(data.playerId)
        await player.gainRollBonus(data.bonusToGain, data.isTemp, false)
        break;

      case Signal.PLAYER_GAIN_ATTACK_ROLL_BONUS:
        player = PlayerManager.getPlayerById(data.playerId)
        await player.gainAttackRollBonus(data.bonusToGain, data.isTemp, false)
        break;

      case Signal.PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS:
        player = PlayerManager.getPlayerById(data.playerId)
        await player.gainFirstAttackRollBonus(data.bonusToGain, data.isTemp, false)
        break;

      case Signal.PLAYER_GET_HIT:
        player = PlayerManager.getPlayerById(data.playerId)
        damageDealer = CardManager.getCardById(data.damageDealerId, true)
        await player.takeDamage(data.damage, false, damageDealer)
        break;
      case Signal.PLAYER_HEAL:
        player = PlayerManager.getPlayerById(data.playerId)
        await player.heal(data.hpToHeal, data.healDown)
        break;
      case Signal.START_TURN:
        await TurnsManager.currentTurn.startTurn()
        break;
      case Signal.PLAYER_ADD_DMG_PREVENTION:
        player = PlayerManager.getPlayerById(data.playerId)
        await player.addDamagePrevention(data.dmgToPrevent, false)
        break;
      case Signal.PLAYER_DIED:
        player = PlayerManager.getPlayerById(data.playerId)
        player._isDead = true
        break;
      case Signal.PLAYER_ADD_CURSE:
        player = PlayerManager.getPlayerById(data.playerId)
        card = CardManager.getCardById(data.cardId)
        player._curses.push(card)
        break;
      // PassiveManager actions.
      case Signal.REMOVE_FROM_PASSIVE_MANAGER:
        try {
          card = CardManager.getCardById(data.cardId, true)
        } catch (error) { }
        if (card != null) { PassiveManager.removePassiveItemEffects(card, false); }
        break;
      case Signal.REGISTER_PASSIVE_ITEM:
        try {
          card = CardManager.getCardById(data.cardId, true)
        } catch (error) { }
        if (card != null) { await PassiveManager.registerPassiveItem(card, false); }
        break;
      case Signal.REGISTER_ONE_TURN_PASSIVE_EFFECT:
        card = CardManager.getCardById(data.cardId);
        const cardEffect = card.getComponent(CardEffect).toAddPassiveEffects[data.effectIndex.index].getComponent(Effect)
        for (let i = 0; i < cardEffect.conditions.length; i++) {
          const conditionData = data.conditionData[i];
          const t = DataInterpreter.convertToEffectData(conditionData);
          cardEffect.conditions[i].conditionData = t
        }
        await PassiveManager.registerOneTurnPassiveEffect(cardEffect, false)
        break;
      case Signal.END_ROLL_ACTION:
        ActionManager.inReactionPhase = false;
        break;
      case Signal.GIVE_PLAYER_PRIORITY:
        player = PlayerManager.getPlayerById(data.playerId)
        await player.givePriority(false)
        break;
      case Signal.GET_REACTION:
        const me = PlayerManager.mePlayer.getComponent(Player);
        try {
          await me.getResponse(data.activePlayerId)
        } catch (error) {
          Logger.error(error)
        }
        break;
      case Signal.RESPOND_TO:
        Stack.hasOtherPlayerRespond = data.stackEffectResponse;
        whevent.emit(GAME_EVENTS.PLAYER_RESPOND)
        break;
      case Signal.DO_STACK_EFFECT:
        Stack.replaceStack(data.currentStack.map(stackEffect => converter.convertToStackEffect(stackEffect)), false)
        const newStack = await Stack.doStackEffectFromTop(false)
        if (newStack != undefined) {
          ServerClient.$.send(Signal.FINISH_DO_STACK_EFFECT, { playerId: data.originPlayerId, newStack: newStack.map(effect => effect.convertToServerStackEffect()) })
        } else {
          ServerClient.$.send(Signal.FINISH_DO_STACK_EFFECT, { playerId: data.originPlayerId, newStack: Stack._currentStack.map(effect => effect.convertToServerStackEffect()) })
        }
        break;
      case Signal.FIZZLE_STACK_EFFECT:
        stackEffect = Stack._currentStack.find(stackEffect => stackEffect.entityId == data.entityId)
        if (stackEffect) {
          await Stack.fizzleStackEffect(stackEffect, data.isSilent, false)
        }
        break;
      case Signal.TURN_PLAYER_DO_STACK_EFFECT:
        await ActionManager.updateActions()
        break;
      case Signal.UPDATE_RESOLVING_STACK_EFFECTS:
        const stackEffectsToSet = data.stackEffects.map(stackEffect => converter.convertToStackEffect(stackEffect))
        await Stack.setToCurrentStackEffectResolving(stackEffectsToSet, false)
        break
      case Signal.FINISH_DO_STACK_EFFECT:
        Stack.newStack = data.newStack.map(stackEffect => converter.convertToStackEffect(stackEffect));
        whevent.emit(GAME_EVENTS.STACK_STACK_EFFECT_RESOLVED_AT_OTHER_PLAYER)
        Stack.hasStackEffectResolvedAtAnotherPlayer = true;
        break;
      case Signal.UPDATE_STACK_LABLE:
        StackLable.updateText(data.stackText)
        break;
      case Signal.STACK_EFFECT_LABLE_CHANGE:
        cc.error(`stack effect lable update`)
        stackEffect = Stack._currentStack.find(se => se.entityId == data.stackId)
        if (stackEffect) {
          stackEffect._lable = data.text
          cc.error(`changed ${stackEffect.name} lable to ${data.text}`)
          cc.log(stackEffect._lable)
          cc.log(Stack._currentStack.find(se => se.entityId == data.stackId)._lable)
        }
        break;
      case Signal.STACK_EMPTIED:
        await Stack.$.onStackEmptied()
        break;
      case Signal.PUT_ON_STACK:
        stackEffect = converter.convertToStackEffect(data.stackEffect)
        player = PlayerManager.getPlayerById(data.originPlayerId)
        await Stack.putOnStackFromServer(stackEffect, player)
        // await Stack.$.onStackEmptied()
        break;
      case Signal.END_PUT_ON_STACK:
        whevent.emit(GAME_EVENTS.PUT_ON_STACK_END)
        // await Stack.$.onStackEmptied()
        break;
      case Signal.ACTIVATE_PASSIVE:
        const cardActivator = CardManager.getCardById(data.cardActivator);
        if (cardActivator == null) {
          cc.log(`shuold not happen!`)
          //   playerActivator.activatePassive(cardActivated, false, passiveIndex);
        } else {

        }

        break;

      // Stack Signals:
      case Signal.NEXT_STACK_ID:
        Stack.stackEffectsIds += 1;
        break;
      case Signal.REPLACE_STACK:
        await Stack.replaceStack(data.currentStack.map(stackEffect => converter.convertToStackEffect(stackEffect)), false)
        break;
      case Signal.REMOVE_FROM_STACK:
        converter = new ServerStackEffectConverter();
        stackEffect = converter.convertToStackEffect(data.stackEffect)
        await Stack.removeAfterResolve(stackEffect, false)
        break;
      case Signal.ADD_TO_STACK:
        converter = new ServerStackEffectConverter();
        stackEffect = converter.convertToStackEffect(data.stackEffect)
        await Stack.addToStack(stackEffect, false)
        break;
      case Signal.UPDATE_STACK_VIS:
        const stackEffectToUpdate = Stack._currentStack.find(effect => effect.entityId == data.stackId)
        //  stackEffectToUpdate.visualRepesentation.flavorText = data.stackVis.flavorText;
        const stackPreview = StackEffectVisManager.$.getPreviewByStackId(stackEffectToUpdate.entityId)
        if (stackEffectToUpdate && stackPreview) {
          stackPreview.stackEffect = stackEffectToUpdate
          stackPreview.updateInfo(data.text, false)
        }
        break
      case Signal.ADD_SE_VIS_PREV:
        converter = new ServerStackEffectConverter();
        StackEffectVisManager.$.addPreview(converter.convertToStackEffect(data.stackEffect), false)
        break
      case Signal.REMOVE_SE_VIS_PREV:
        StackEffectVisManager.$.removePreview(data.stackEffectId, false)
        break
      case Signal.CLEAR_SE_VIS:
        StackEffectVisManager.$.clearPreviews(false)
        break
      case Signal.UPDATE_STACK_EFFECT:
        converter = new ServerStackEffectConverter();
        stackEffect = converter.convertToStackEffect(data.stackEffect)
        Stack._currentStack.splice(Stack._currentStack.findIndex(stackE => stackE.entityId == stackEffect.entityId), 1, stackEffect)
        break
      //

      // Board signals
      case Signal.SET_TURN:
        const turn = TurnsManager.getTurnByPlayerId(data.playerId)
        await TurnsManager.setCurrentTurn(turn, false)
        break;
      case Signal.ASSIGN_CHAR_TO_PLAYER:
        cc.log(data)
        player = PlayerManager.getPlayerById(data.playerId)
        let charCard = CardManager.getCardById(data.charCardId, true)
        let itemCard = CardManager.getCardById(data.itemCardId, true)
        itemCard.getComponent(Item).eternal = true
        await player.setCharacter(charCard, itemCard, false)
        break
      case Signal.SET_CHAR:
        player = PlayerManager.mePlayer.getComponent(Player)
        charCard = CardManager.getCardById(data.charCardId, true)
        itemCard = CardManager.getCardById(data.itemCardId, true)
        itemCard.getComponent(Item).eternal = true
        await player.setCharacter(charCard, itemCard, true)
        ServerClient.$.send(Signal.SET_CHAR_END, { playerId: data.originPlayerId })
        break
      case Signal.SET_CHAR_END:
        whevent.emit(GAME_EVENTS.END_SET_CHAR)
        break
      case Signal.NEW_MONSTER_PLACE:
        await MonsterField.addMonsterToNewPlace(false)
        break;
      case Signal.FLIP_CARD:
        card = CardManager.getCardById(data.cardId, true)
        card.getComponent(Card).flipCard(false)
        break;
      case Signal.END_BATTLE:
        await BattleManager.endBattle(false)
        break
      case Signal.SHOW_DECISION:
        await DecisionMarker.$.showDecision(CardManager.getCardById(data.startCardId), CardManager.getCardById(data.endCardId), false, data.flipEndCard)
        break
      case Signal.SET_STACK_ICON:
        await DecisionMarker.$.setStackIcon(StackEffectVisManager.$.stackIcons[data.iconIndex], false)
        break
      case Signal.SHOW_STACK_EFFECT:
        await DecisionMarker.$.showStackEffect(data.effectId, false)
        break
      case Signal.SHOW_DICE_ROLL:
        const diceRoll = Stack._currentStack.find(stack => stack.entityId == data.stackId) as AttackRoll | RollDiceStackEffect
        diceRoll.visualRepesentation.extraSprite = PlayerManager.getPlayerByCardId(diceRoll.creatorCardId).dice.diceSprite.spriteFrame
        await DecisionMarker.$.showDiceRoll(diceRoll, false)
        break
      case Signal.SHOW_EFFECT_CHOSEN:
        await DecisionMarker.$.showEffectFromServer(CardManager.getCardById(data.cardId), data.pos, data.size)
        break
      //

      // eden signals
      case Signal.CHOOSE_FOR_EDEN:
        CardManager.treasureDeck.getComponent(Deck).shuffleDeck()

        // filter eden available cards:
        let cardsNotFiltered = true
        const cardsToChooseFrom: cc.Node[] = []
        let i = 0
        do {
          const cardToChoose = CardManager.treasureDeck.getComponent(Deck)._cards.getCard(i);
          if (cardToChoose.getComponent(CardEffect).hasDestroySelfEffect) {
          } else {
            cardsToChooseFrom.push(cardToChoose)
            if (cardsToChooseFrom.length == 3) {
              cardsNotFiltered = true;
              break;
            }
          }
          i++;
          if (i > CardManager.treasureDeck.getComponent(Deck)._cards.length - 1) { cc.error(`i is bigger than cards length, not possible!`) }
        } while (cardsNotFiltered);
        const chosenCards = await CardPreviewManager.selectFromCards(cardsToChooseFrom, 1)
        const chosen = chosenCards.pop()
        if (chosen) {
          ServerClient.$.send(Signal.EDEN_CHOSEN, { cardId: chosen.getComponent(Card)._cardId, playerId: data.originPlayerId })
        } else {
          Logger.error(`No card was chosen for eden`)
        }
        break;
      case Signal.EDEN_CHOSEN:
        card = CardManager.getCardById(data.cardId)
        PlayerManager.edenChosenCard = card;
        PlayerManager.edenChosen = true
        whevent.emit(GAME_EVENTS.EDEN_WAS_CHOSEN)
        break;

      ///

      // Action Lable Signals
      case Signal.ACTION_MASSAGE_ADD:
        const massage = new ActionMessage(data.massage._id, data.massage._text);
        ActionLable.$.putMassage(massage, data.childOfId)
        break;
      case Signal.ACTION_MASSAGE_REMOVE:
        ActionLable.$.removeMessage(data.id, false)
        break;
      ///

      //Announcement Lalbe
      case Signal.SHOW_ANNOUNCEMENT:
        AnnouncementLable.$.showAnnouncement(data.text, 0, false)
        break;
      case Signal.HIDE_ANNOUNCEMENT:
        AnnouncementLable.$.hideAnnouncement(false)
        break;
      case Signal.SHOW_TIMER:
        AnnouncementLable.$.showTimer(data.time, false)
        break;
      case Signal.HIDE_TIMER:
        AnnouncementLable.$.hideTimer(false)
        break;

      // Particle Effect Signals
      case Signal.ACTIVATE_PARTICLE_EFFECT:
        card = CardManager.getCardById(data.cardId)
        ParticleManager.activateParticleEffect(card, data.particleType, false)
        break;
      case Signal.DISABLE_PARTICLE_EFFECT:
        card = CardManager.getCardById(data.cardId)
        ParticleManager.disableParticleEffect(card, data.particleType, false)
        break;
      case Signal.SHOW_REACTIONS:
        // let c: number[] = data.cardsIds;
        // cards.set(c.map(id => { cc.log(id); return CardManager.getCardById(id) }))
        // for (const card of cards.getCards()) {
        //   AnimationManager.$.showAnimation(card, ANIM_COLORS.BLUE)
        // }
        player = PlayerManager.getPlayerById(data.playerId)
        AnimationManager.$.showAnimation(player.character, ANIM_COLORS.RED)
        break;
      case Signal.REACTION_TOGGLED:
        player = PlayerManager.getPlayerById(data.playerId)
        // player._reactionToggle.toggleThis(false)
        if (player._reactionToggle.isChecked) {
          player._reactionToggle.uncheck(false)
        } else {
          player._reactionToggle.check(false)
        }
        break
      case Signal.HIDE_REACTIONS:
        // cards.set(data.cardsIds.map(id => { CardManager.getCardById(id) }))
        // for (const card of cards.getCards()) {
        //   AnimationManager.$.endAnimation(card)
        // }
        player = PlayerManager.getPlayerById(data.playerId)
        AnimationManager.$.endAnimation(player.character)
        break;
      // Passive Effects Signals
      case Signal.UPDATE_PASSIVE_DATA:
        const newData = data.passiveData;
        if (newData) {
          const serverPassiveData = new ServerPassiveMeta()
          serverPassiveData.args = newData.args
          serverPassiveData.methodScopeId = newData.methodScopeId
          serverPassiveData.passiveEvent = newData.passiveEvent
          serverPassiveData.result = newData.result
          serverPassiveData.scopeIsPlayer = newData.scopeIsPlayer
          serverPassiveData.index = newData.index
          PassiveManager.updatePassiveMethodData(serverPassiveData.convertToPassiveMeta(), data.isAfterActivation, false)
        } else {
          PassiveManager.updatePassiveMethodData(null, data.isAfterActivation, false)
        }
        break;
      case Signal.CLEAR_PASSIVE_DATA:
        PassiveManager.clearPassiveMethodData(data.index, data.isAfterActivation, false)
        break;
      ///

      case Signal.DECK_ARRAGMENT:

        data.arrangement.map(id => cards.push(CardManager.getCardById(id, true)))
        const deckToSet = CardManager.getDeckByType(data.deckType)
        deckToSet.getComponent(Deck).setDeckCards(cards)
        break;
      case Signal.CARD_GET_COUNTER:
        card = CardManager.getCardById(data.cardId, true)
        card.getComponent(Card)._counters += data.numOfCounters
        break;
      default:

        break;
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

    // //set up turn change listener
    // this.node.parent.on("turnChanged", this.updateAfterTurnChange, this);

    // whevent.on(GAME_EVENTS.STACK_EMPTIED, ActionManager.checkForDeadEntities)

    // TODO expand to includ all of the turn plays (buying,fighting,playing loot card)
    // TODO dont forget to exlude all available reactions from all other players when available!
  }

  start() { }

  // update (dt) {}
}
