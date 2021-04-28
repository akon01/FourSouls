import { Component, error, find, log, Node, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { whevent } from "../../ServerClient/whevent";
import { AddTrinketOrCurse } from "../CardEffectComponents/CardEffects/AddTrinketOrCurse";
import { Effect } from '../CardEffectComponents/CardEffects/Effect';
import { ChooseCard } from "../CardEffectComponents/DataCollector/ChooseCard";
import { BUTTON_STATE, CARD_TYPE, GAME_EVENTS, ROLL_TYPE } from "../Constants";
import { ActionMessage } from "../Entites/ActionMessage";
import { CardEffect } from "../Entites/CardEffect";
import { CardLayout } from "../Entites/CardLayout";
import { Item } from "../Entites/CardTypes/Item";
import { Monster } from "../Entites/CardTypes/Monster";
import { Card } from "../Entites/GameEntities/Card";
import { Deck } from "../Entites/GameEntities/Deck";
import { Dice } from "../Entites/GameEntities/Dice";
import { Player } from "../Entites/GameEntities/Player";
import { IAttackableEntity } from '../Entites/IAttackableEntity';
import { MonsterCardHolder } from "../Entites/MonsterCardHolder";
import { Turn } from "../Modules/TurnsModule";
import { AttackRoll } from "../StackEffects/AttackRoll";
import { RollDiceStackEffect } from "../StackEffects/RollDIce";
import { ServerStackEffectConverter } from "../StackEffects/ServerSideStackEffects/ServerStackEffectConverter";
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';
import { ServerEffect } from "./../Entites/ServerCardEffect";
import { ANIM_COLORS } from "./AnimationManager";
import { ServerPassiveMeta } from "./ServerPassiveMeta";
import { WrapperProvider } from './WrapperProvider';
const { ccclass } = _decorator;

enum CARD_ACTIONS {
  ATTACKABLE, BUYABLE, ACTIVATEABLE, PLAYABLE
}

@ccclass('ActionManager')
export class ActionManager extends Component {
  loggerWrapper: any;



  currentPlayer: Node | null = null;
  allPlayers: Node[] = [];
  currentTurn: Turn | null = null;
  turnsManager: Node | null = null;
  playersManager: Node | null = null;
  cardManager: Node | null = null;
  decks: Node[] = [];
  ButtonManager: Node | null = null;
  pileManager: Node | null = null;
  serverEffectStack: ServerEffect[] = [];
  noMoreActionsBool = false;
  inReactionPhase = false;


  // test only!!
  reactionChainNum = 0;


  lootPlayedInAction(cardId: any) {
  }

  async updateCardAction(card: Node, action: CARD_ACTIONS) {
    const playerComp = card.getComponent(Player);
    if (playerComp) {
      card = playerComp.character!
    }
    WrapperProvider.cardManagerWrapper.out.disableCardActions(card);
    try {
      switch (action) {
        case CARD_ACTIONS.ACTIVATEABLE:
          WrapperProvider.cardManagerWrapper.out.makeItemActivateable(card);
          break;
        case CARD_ACTIONS.ATTACKABLE:
          await WrapperProvider.cardManagerWrapper.out.makeMonsterAttackable(card);
          break;
        case CARD_ACTIONS.BUYABLE:
          WrapperProvider.cardManagerWrapper.out.makeItemBuyable(card);
          break;
        case CARD_ACTIONS.PLAYABLE:
          WrapperProvider.cardManagerWrapper.out.makeLootPlayable(card);
          break;
        default:
          break;
      }
    } catch (error) {
      WrapperProvider.loggerWrapper.out.error(error)
    }
  }

  disableCardActionsAndMake(card: Node) {
    WrapperProvider.cardManagerWrapper.out.disableCardActions(card);
    WrapperProvider.cardManagerWrapper.out.makeCardPreviewable(card)
  }

  isInUpdate = false

  async updateActionsForTurnPlayer(playerNode: Node) {
    if (this.isInUpdate) {
      return
    } else {
      this.isInUpdate = true
    }
    this.decks = WrapperProvider.cardManagerWrapper.out.getAllDecks();
    const treasureDeck = WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!;
    const monsterDeck = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!;
    // const monsterTopCard = monsterDeck.topBlankCard;
    // set up components
    const player: Player = playerNode.getComponent(Player)!;
    const currentPlayerHand: Node = player.hand!.node
    const currentPlayerHandComp: CardLayout = currentPlayerHand.getComponent(CardLayout)!;
    const allFlippedCards = WrapperProvider.cardManagerWrapper.out.GetAllCards().filter(card => (!card.getComponent(Card)!._isShowingBack))!;

    if (!WrapperProvider.turnsManagerWrapper.out.currentTurn) { debugger; throw new Error("No Current Turn") }
    if (!WrapperProvider.buttonManagerWrapper.out.nextTurnButton) { debugger; throw new Error("No Next Turn Button"); }

    console.log(`attack plays: ${player.attackPlays}`)
    console.log(`buy plays: ${player.buyPlays}`)
    console.log(`loot plays ${player.getLootCardPlays()}`)
    console.log("in Battle Phase:" + WrapperProvider.turnsManagerWrapper.out.currentTurn.battlePhase)


    //if the stack is empty and the player hp is above 0
    if (WrapperProvider.stackWrapper.out._currentStack.length == 0 && player._Hp > 0) {

      //if the player doesnt have must attack mosnter/deck , let him skip turn
      if (player._mustAttackPlays <= 0 && player._mustDeckAttackPlays <= 0) {
        // make next turn btn available
        WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.nextTurnButton!, BUTTON_STATE.ENABLED)
      }

      // update player available reactions
      player.calculateReactions();

      // make all table cards not moveable but available for preview
      if (WrapperProvider.cardManagerWrapper.out.allCards.length != 0) {
        for (let i = 0; i < allFlippedCards.length; i++) {
          const card = allFlippedCards[i]
          WrapperProvider.cardManagerWrapper.out.disableCardActions(card);
          WrapperProvider.cardManagerWrapper.out.makeCardPreviewable(card);
        }
      }

      //make loot deck previewable
      WrapperProvider.cardManagerWrapper.out.makeCardPreviewable(WrapperProvider.cardManagerWrapper.out.lootDeck)

      // if not in battle phase allow other actions (buying,playing turnLoot,activating items,attacking a monster)
      const playerComponent = playerNode.getComponent(Player)!;
      if (!WrapperProvider.turnsManagerWrapper.out.currentTurn.battlePhase || WrapperProvider.stackWrapper.out._currentStack.length > 0) {
        // make store cards buyable (add check for money)
        await WrapperProvider.actionManagerWrapper.out.decideForBuyable(playerNode, treasureDeck);

        // make monster cards attackable
        await WrapperProvider.actionManagerWrapper.out.decideForAttackable(monsterDeck);
        // make current player loot card playable
        await WrapperProvider.actionManagerWrapper.out.DecideForPlayable(currentPlayerHandComp);
        // if Items are charged make them playable
        await WrapperProvider.actionManagerWrapper.out.decideForActivateable(playerNode);
        playerComponent.dice!.getComponent(Dice)!.disableRoll()!;

        // if in battle phase do battle
      } else if (WrapperProvider.turnsManagerWrapper.out.currentTurn.battlePhase) {
        console.log(`in battle phase do battle`)

        const monsters = [...WrapperProvider.monsterFieldWrapper.out.getActiveMonsters(), monsterDeck.node]
        monsters.forEach(monster => {
          this.disableCardActionsAndMake(monster)
        });
        //Disable Next Turn Button if the monster is not dead
        WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.nextTurnButton!, BUTTON_STATE.DISABLED)
        if (!WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity) { debugger; throw new Error("No Currently Attacked Monster"); }

        // enable activating items
        if (WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity.getCurrentHp() > 0) {
          await this.decideForActivateable(playerNode)
          // enable playing loot if you havnet already
          await this.DecideForPlayable(currentPlayerHandComp)
          // if its a first attack
          if (WrapperProvider.battleManagerWrapper.out.firstAttack) {
            // allow rolling of a dice
            playerComponent.dice!.addRollAction(ROLL_TYPE.FIRST_ATTACK);
            // if its not the first attack
          } else {
            playerComponent.dice!.addRollAction(ROLL_TYPE.ATTACK);
          }

        } else {
          WrapperProvider.loggerWrapper.out.error(`currently attacked monster has 0 hp,should not happen, should not be in combat`)
          WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.nextTurnButton!, BUTTON_STATE.DISABLED)

        }
      } else {
        WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.nextTurnButton!, BUTTON_STATE.DISABLED)
      }
    }
    this.isInUpdate = false
  }

  private async decideForBuyable(player: Node, treasureDeck: Deck) {
    const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!;
    const PlayerComp = player.getComponent(Player)!;
    const storeCards = WrapperProvider.storeWrapper.out.getStoreCards();
    if (turnPlayer.buyPlays > 0) {
      for (let i = 0; i < storeCards.length; i++) {
        const storeCard = storeCards[i];
        if (PlayerComp.coins >= PlayerComp.getStoreCost()) {
          await this.updateCardAction(storeCard, CARD_ACTIONS.BUYABLE);
          //     WrapperProvider.cardManagerWrapper.out.makeItemBuyable(storeCard);
        } else {
          this.disableCardActionsAndMake(storeCard);
          WrapperProvider.animationManagerWrapper.out.endAnimation(storeCard);
        }
      }

      if (PlayerComp.coins >= WrapperProvider.storeWrapper.out.topCardCost) {
        await this.updateCardAction(treasureDeck.node, CARD_ACTIONS.BUYABLE);
      } else {
        this.disableCardActionsAndMake(treasureDeck.node);
        WrapperProvider.animationManagerWrapper.out.endAnimation(treasureDeck.node);
      }
    } else {
      for (let i = 0; i < storeCards.length; i++) {
        const storeCard = storeCards[i];
        this.disableCardActionsAndMake(storeCard);
        WrapperProvider.animationManagerWrapper.out.endAnimation(storeCard);
      }
      this.disableCardActionsAndMake(treasureDeck.node);
      WrapperProvider.animationManagerWrapper.out.endAnimation(treasureDeck.node);
    }
  }

  private async decideForAttackable(monsterDeck: Deck) {

    const monsters = [...WrapperProvider.monsterFieldWrapper.out.getActiveMonsters(), monsterDeck.node, ...WrapperProvider.playerManagerWrapper.out.players]
    const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!;
    if (turnPlayer._mustAttackMonsters.length > 0) {
      turnPlayer._mustAttackMonsters.forEach(async monster => {
        await this.updateCardAction(monster.node, CARD_ACTIONS.ATTACKABLE);
      });
      return
    }
    if (turnPlayer.attackPlays > 0 || turnPlayer._mustAttackPlays > 0) {
      for (let i = 0; i < monsters.length; i++) {
        console.log(`i=${i}`);

        const activeMonster = monsters[i];
        const monsterComp: IAttackableEntity | null = activeMonster.getComponent(Monster) ?? activeMonster.getComponent(Player);
        if ((monsterComp != null && !monsterComp.getCanBeAttacked()) || monsterComp == null) {
          await this.updateCardAction(activeMonster, CARD_ACTIONS.ATTACKABLE);
        }
      }
    } else {
      for (let i = 0; i < monsters.length; i++) {
        const activeMonster = monsters[i];
        this.disableCardActionsAndMake(activeMonster);
      }
    }
    if (turnPlayer._mustDeckAttackPlays > 0 || turnPlayer._attackDeckPlays > 0) {
      await this.updateCardAction(monsterDeck.node, CARD_ACTIONS.ATTACKABLE);
    }
  }

  private async DecideForPlayable(currentPlayerHandComp: CardLayout) {
    const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!;
    if (turnPlayer.getLootCardPlays() > 0) {
      WrapperProvider.cardManagerWrapper.out.setOriginalSprites(currentPlayerHandComp.layoutCards);
      for (let i = 0; i < currentPlayerHandComp.layoutCards.length; i++) {
        const card = currentPlayerHandComp.layoutCards[i];
        await this.updateCardAction(card, CARD_ACTIONS.PLAYABLE);
      }
    } else {
      for (let i = 0; i < currentPlayerHandComp.layoutCards.length; i++) {
        const card = currentPlayerHandComp.layoutCards[i];
        await this.disableCardActionsAndMake(card);
      }
    }
  }

  private async decideForActivateable(player: Node) {
    const activeItems = player.getComponent(Player)!.getActiveItems()!;
    for (let i = 0; i < activeItems.length; i++) {
      const item = activeItems[i].getComponent(Item)!;
      if (item.needsRecharge == false) {
        await this.updateCardAction(item.node, CARD_ACTIONS.ACTIVATEABLE);
      } else {
        this.disableCardActionsAndMake(item.node);
      }
    }
    const paidItems = player.getComponent(Player)!.getPaidItems()
    for (let i = 0; i < paidItems.length; i++) {
      const item = paidItems[i].getComponent(Item)!;
      await this.updateCardAction(item.node, CARD_ACTIONS.ACTIVATEABLE);
    }
  }

  updateActionsForNotTurnPlayer(player: Node) {
    this.decks = WrapperProvider.cardManagerWrapper.out.getAllDecks();
    const turnPlayer = WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.getTurnPlayer()!
    const playerComp = player.getComponent(Player)!;
    //show current turn player ////currently flashing, think of something smarter

    // update player reactions:
    playerComp.calculateReactions();
    playerComp.dice!.getComponent(Dice)!.disableRoll()!;

    // if (!WrapperProvider.actionManagerWrapper.out.inReactionPhase) {
    const allFlippedCards = new Set([
      ...WrapperProvider.cardManagerWrapper.out.GetAllCards().filter(card => !card.getComponent(Card)!._isShowingBack),
      WrapperProvider.cardManagerWrapper.out.treasureDeck,
      WrapperProvider.cardManagerWrapper.out.monsterDeck,
      ...playerComp.hand!.layoutCards,
      ...playerComp.getActiveItems(),
      ...playerComp.getPassiveItems(),
      ...playerComp.getPaidItems()]);
    // make all table cards available for preview
    if (allFlippedCards.size != 0) {
      allFlippedCards.forEach(card => {
        this.disableCardActionsAndMake(card)
        WrapperProvider.animationManagerWrapper.out.endAnimation(card)
      }
      )
    }
    if (player != turnPlayer.node) {
      WrapperProvider.animationManagerWrapper.out.showAnimation(turnPlayer.character!, ANIM_COLORS.WHITE)
    }
    // make other players cards invisible and not moveable
    const otherPlayersHandCards: Node[] = WrapperProvider.cardManagerWrapper.out.getOtherPlayersHandCards(
      player,
    );
    if (otherPlayersHandCards.length != 0) {
      for (let i = 0; i < otherPlayersHandCards.length; i++) {
        const card = otherPlayersHandCards[i].getComponent(Card)!;
        if (!card._isShowingBack) { card.flipCard(false) }
        this.disableCardActionsAndMake(card.node)
      }
    }

    // set up components
    // disable next turn btn
    WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.nextTurnButton!, BUTTON_STATE.DISABLED)

    // Set up listener to card selected
    return true
    //  }
  }

  checkingForDeadEntities = false;

  waitForCheckingDeadEntities() {
    return new Promise((resolve) => {
      whevent.onOnce(GAME_EVENTS.CHECK_FOR_DEAD_ENTITIES, () => {
        resolve(true);
      })
    });
  }

  async checkForDeadEntities() {
    if (WrapperProvider.actionManagerWrapper.out.checkingForDeadEntities) { return }
    WrapperProvider.actionManagerWrapper.out.checkingForDeadEntities = true
    for (let i = 0; i < WrapperProvider.playerManagerWrapper.out.players.length; i++) {
      const player = WrapperProvider.playerManagerWrapper.out.players[i].getComponent(Player)!;
      if (player._Hp == 0 && !player._isDead) {
        await player.killPlayer(true, player._killer!)
        player._killer = null;
      }
    }
    const activeMonsters = WrapperProvider.monsterFieldWrapper.out.getActiveMonsters()
    for (let i = 0; i < activeMonsters.length; i++) {
      const activeMonster = activeMonsters[i].getComponent(Monster)!;
      if (activeMonster.currentHp == 0 && !activeMonster._isDead) {
        await activeMonster.kill(activeMonster.killer!)
        activeMonster.killer = null;
      }
    }
    WrapperProvider.actionManagerWrapper.out.checkingForDeadEntities = false
    whevent.emit(GAME_EVENTS.CHECK_FOR_DEAD_ENTITIES)
  }

  isUpdateActionsRunning = false;

  async updateActions() {

    // await WrapperProvider.cardManagerWrapper.out.updatePlayerCards();

    await WrapperProvider.cardManagerWrapper.out.updateOnTableCards();

    // await WrapperProvider.cardManagerWrapper.out.checkForEmptyFields();

    if (WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.getTurnPlayer()!.playerId == WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId) {

      // await WrapperProvider.cardManagerWrapper.out.updatePassiveListeners();

      await this.updateActionsForTurnPlayer(WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.getTurnPlayer()!.node);

    } else {

      await this.updateActionsForNotTurnPlayer(WrapperProvider.playerManagerWrapper.out.mePlayer!);

    }

  }
  cardEffectToDo: { playedCard: Node, playerId: number, passiveIndex?: number } | null = null;

  waitForAllEffectsOn = false;

  inRollAction = false;

  async getActionFromServer(signal: string, data: any) {
    WrapperProvider.loggerWrapper.out.printMethodSignal([signal, data], false)
    let player: Player | null = null;
    let card: Node | null;
    let deck: Deck;
    let monsterHolder: MonsterCardHolder
    let monster: Monster
    let place: Node;
    let stackEffect: StackEffectInterface
    let converter = new ServerStackEffectConverter();
    const cards: number[] = []
    let cardsToChooseFrom: Node[]
    let chosenCards: Node[] = []
    let cardEffectComp: CardEffect
    let cardEffect: Effect
    const treasureDeck = WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!;
    switch (signal) {
      case Signal.END_GAME:
        WrapperProvider.mainScriptWrapper.out.endGame(data.playerId, false)
        break;
      case Signal.GAME_HAS_STARTED:
        WrapperProvider.soundManagerWrapper.out.setBGVolume(0.5)
        WrapperProvider.soundManagerWrapper.out.playBGMusic(WrapperProvider.soundManagerWrapper.out.BasicBGMusic!)
        WrapperProvider.mainScriptWrapper.out.gameHasStarted = true
        break;
      case Signal.DISCARD_LOOT:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)!
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true);
        await player.discardLoot(card, false);
        // WrapperProvider.actionManagerWrapper.out.updateActions();
        break;
      case Signal.NEW_MONSTER_ON_PLACE:
        const newMonster = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true);
        const monsterDeck = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!;
        const monsterIndex = monsterDeck.getCards().indexOf(newMonster)
        if (monsterIndex != -1) {
          monsterDeck.removeCard(monsterIndex);
        }
        await WrapperProvider.monsterFieldWrapper.out.addMonsterToExsistingPlace(data.monsterPlaceId, newMonster, false);
        break;
      case Signal.SHOW_CARD_PREVIEW:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        const tempCards: Node[] = []
        data.cardsToShowId.forEach((cardToShowId: number) => {
          tempCards.push(WrapperProvider.cardManagerWrapper.out.getCardById(cardToShowId, true))
        });
        //   card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardToShowId, true);
        // add a lable with who is selecting.
        await WrapperProvider.cardPreviewManagerWrapper.out.getPreviews(tempCards, true);
        break;
      case Signal.ACTIVATE_ITEM:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId);
        console.log(`should not happen`)
        //  let itemActivated = await player.activateItem(card, false);
        break;
      case Signal.ROLL_DICE:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }

        player.dice!.activateRollAnimation();
        break;
      case Signal.ROLL_DICE_ENDED:

        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        player.dice!.endRollAnimation();
        player.dice!.setRoll(data.numberRolled);
        break;
      case Signal.MOVE_CARD:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true)
        switch (data.placeType) {
          case `Hand`:
            place = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.placeID)!.hand!.node
            break;
          case `Desk`:
            place = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.placeID)!.desk!.node
            break
          case `soulsLayout`:
            place = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.placeID)!.desk!.soulsLayout!
            break
          case `Card`:
            place = WrapperProvider.cardManagerWrapper.out.getCardById(data.placeID, true)
            break;
          default:
            throw new Error("No Place Found");

        }
        await WrapperProvider.cardManagerWrapper.out.moveCardTo(card, place, false, data.flipIfFlipped, data.moveIndex, data.firstPos, data.playerId)
        break;
      case Signal.SOUL_CARD_MOVE_END:
        whevent.emit(GAME_EVENTS.SOUL_CARD_MOVE_END)
        break;
      case Signal.CARD_CHANGE_COUNTER:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        await card.getComponent(Card)?.putCounter(data.numOfCounters, false)
        break
      case Signal.ADD_EGG_COUNTER:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        const cardToAddEggCounterComp = card.getComponent(Card)!
        if (cardToAddEggCounterComp.type === CARD_TYPE.CHAR) {
          player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(card)
          await player?.addEggCounters(data.numToChange, false)
        } else {
          await card.getComponent(Monster)!.addEggCounters(data.numToChange, false)
        }
        break;
      case Signal.REMOVE_EGG_COUNTER:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        const cardToRemoveEggCounterComp = card.getComponent(Card)!
        if (cardToRemoveEggCounterComp.type === CARD_TYPE.CHAR) {
          player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(card)
          await player?.removeEggCounters(data.numToChange, false)
        } else {
          await card.getComponent(Monster)!.removeEggCounters(data.numToChange, false)
        }
        break;
      case Signal.CARD_CHANGE_NUM_OF_SOULS:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        card.getComponent(Card)?.changeNumOfSouls(data.diff, false)
        break
      case Signal.CARD_SET_OWNER:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId);
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        card.getComponent(Card)?.setOwner(player, false)
        break
      case Signal.USE_ITEM:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        card.getComponent(Item)!.useItem(false)
        break;
      case Signal.RECHARGE_ITEM:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        card.getComponent(Item)!.rechargeItem(false)
        break;
      case Signal.ITEM_SET_LAST_OWNER:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) throw new Error(`No Player Found With Id:${data.playerId}`);
        card.getComponent(Item)?.setLastOwner(player, false)
        break
      case Signal.MOVE_CARD_END:
        WrapperProvider.cardManagerWrapper.out.receiveMoveCardEnd(data.moveIndex)
        break;
      case Signal.NEXT_TURN:
        WrapperProvider.actionManagerWrapper.out.inReactionPhase = false;
        const currentTurnPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerById(WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.PlayerId)!;
        await currentTurnPlayer.getComponent(Player)!.endTurn(false)!;
        break;
      case Signal.END_TURN:
        await WrapperProvider.turnsManagerWrapper.out.endTurn(false)
        break;
      case Signal.ADD_TURN:
        WrapperProvider.turnsManagerWrapper.out.addOneTimeTurn(data.playerId, false)
        break
      case Signal.REMOVE_TURN:
        const turns = WrapperProvider.turnsManagerWrapper.out.getTurns()
        const turnToRemove = turns[data.turnIndex]
        WrapperProvider.turnsManagerWrapper.out.removeTurn(turnToRemove, false)
        break
      case Signal.MOVE_CARD_TO_PILE:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true);
        await WrapperProvider.pileManagerWrapper.out.addCardToPile(data.type, card, false);
        break;
      case Signal.REMOVE_FROM_PILE:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true);
        await WrapperProvider.pileManagerWrapper.out.removeFromPile(card, false);
        break;
      case Signal.GET_SOUL:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true);
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.receiveSoulCard(card, false)
        card.setParent(player.soulsLayout)
        card.setPosition(0, 0)
        break;
      case Signal.LOSE_SOUL:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true);
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.loseSoul(card, false)
        break;
      // On Monster Events
      case Signal.MONSTER_GET_DAMAGED:
        monster = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true).getComponent(Monster)!;
        let damageDealer = WrapperProvider.cardManagerWrapper.out.getCardById(data.dmgDlrId)
        monster.currentHp = data.hpLeft
        // await monster.getDamaged(data.damage, false, damageDealer)
        break;
      case Signal.MONSTER_GAIN_HP:
        monster = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true).getComponent(Monster)!;
        await monster.gainHp(data.hpToGain, false)
        break;

      case Signal.MONSTER_GAIN_DMG:
        monster = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true).getComponent(Monster)!;
        await monster.gainDMG(data.DMGToGain, false)
        break;
      case Signal.MONSTER_GAIN_ROLL_BONUS:
        monster = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true).getComponent(Monster)!;
        await monster.gainRollBonus(data.bonusToGain, false)
        break;
      case Signal.MONSTER_HEAL:
        monster = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true).getComponent(Monster)!;
        await monster.heal(data.hpToGain, false)
        break;
      case Signal.MONSTER_ADD_DMG_PREVENTION:
        monster = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true).getComponent(Monster)!;
        await monster.addDamagePrevention(data.dmgToPrevent, false)
        break;

      // Monster holder actions
      case Signal.GET_NEXT_MONSTER:
        monsterHolder = WrapperProvider.monsterFieldWrapper.out.getMonsterPlaceById(data.monsterPlaceId);
        await monsterHolder.getNextMonster(false);
        break;
      case Signal.ADD_MONSTER:
        monsterHolder = WrapperProvider.monsterFieldWrapper.out.getMonsterPlaceById(data.monsterPlaceId);
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.monsterId, true)
        await monsterHolder.addToMonsters(card, false);
        break;
      case Signal.REMOVE_MONSTER:
        monsterHolder = WrapperProvider.monsterFieldWrapper.out.getMonsterPlaceById(data.holderId);
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.monsterId, true)
        await monsterHolder.removeMonster(card, false);
        break;

      // Deck actions
      case Signal.CARD_DRAWN:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true)
        deck = WrapperProvider.cardManagerWrapper.out.getDeckByType(data.deckType).getComponent(Deck)!;
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.drawCards(deck.node, false, [card]);
        break;
      case Signal.DECK_ADD_TO_TOP:
        deck = WrapperProvider.cardManagerWrapper.out.getDeckByType(data.deckType).getComponent(Deck)!
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true)
        deck.addToDeckOnTop(card, data.offset, false)
        break;
      case Signal.DECK_ADD_TO_BOTTOM:
        deck = WrapperProvider.cardManagerWrapper.out.getDeckByType(data.deckType).getComponent(Deck)!
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true)
        deck.addToDeckOnBottom(card, data.offset, false)
        break;
      case Signal.DRAW_CARD:
        deck = WrapperProvider.cardManagerWrapper.out.getDeckByType(data.deckType).getComponent(Deck)!
        deck.drawCard(false)
        break;
      case Signal.MARK_DECK_AS_DRAW_FROM_PILE_INSTED:
        deck = WrapperProvider.cardManagerWrapper.out.getDeckByType(data.deckType).getComponent(Deck)!
        deck._isDrawFromPileInsted = data.markAsTrue
        break;
      case Signal.ADD_STORE_CARD:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true)
        WrapperProvider.storeWrapper.out.addStoreCard(false, card);
        break;
      case Signal.SET_MAX_ITEMS_STORE:
        await WrapperProvider.storeWrapper.out.addMaxNumOfItems(data.number, false);
        break;
      case Signal.REMOVE_ITEM_FROM_SHOP:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true)
        await WrapperProvider.storeWrapper.out.removeFromStore(card, false);
        break;

      // OnPlayer actions

      case Signal.PLAY_LOOT_CARD:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true);
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.playLootCard(card, false);
        break;
      case Signal.CARD_ADD_TRINKET:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        const addTrinketEffect = card.getComponent(AddTrinketOrCurse)!
        addTrinketEffect.removeAddTrinketEffect()
        break;
      case Signal.ADD_AN_ITEM:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true);
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.addItem(card, false, data.isReward);
        break;
      case Signal.DECLARE_ATTACK:
        const attackedMonster = WrapperProvider.cardManagerWrapper.out.getCardById(
          data.attackedMonsterId,
          true,
        );
        await WrapperProvider.battleManagerWrapper.out.declareAttackOnMonster(attackedMonster, false)
        break;
      case Signal.PLAYER_PROP_UPDATE:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        // player.updateProperties(data.properties)
        break;
      case Signal.PLAYER_GET_LOOT:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true);
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.gainLoot(card, false)
        break;
      case Signal.PLAYER_LOSE_LOOT:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true);
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.loseLoot(card, false)
        break;
      case Signal.PLAYER_CHANGE_LOOT_CARD_PLAYS:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        player?.changeLootCardPlayes(data.diff, false)
        break
      case Signal.CHANGE_MONEY:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.changeMoney(data.numOfCoins, false, data.isStartGame)
        break;
      case Signal.CHANGE_TURN_DRAW_PLAYS:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { throw new Error(`No Player Found With Id ${data.playerId}`); }
        player.changeTurnDrawPlays(data.quantityToChange, false)
        break;
      case Signal.SET_MONEY:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        player.setMoney(data.numOfCoins, false)
        break;
      case Signal.PLAYER_GAIN_HP:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.gainHeartContainer(data.hpToGain, data.isTemp, false)
        break;
      case Signal.PLAYER_GAIN_DMG:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.gainDMG(data.DMGToGain, data.isTemp, false)
        break;
      case Signal.PLAYER_GAIN_ROLL_BONUS:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.gainRollBonus(data.bonusToGain, data.isTemp, false)
        break;

      case Signal.PLAYER_GAIN_ATTACK_ROLL_BONUS:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.gainAttackRollBonus(data.bonusToGain, data.isTemp, data.isOnlyNextAttack, false)
        break;

      case Signal.PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.gainFirstAttackRollBonus(data.bonusToGain, data.isTemp, false)
        break;

      case Signal.PLAYER_GET_HIT:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        damageDealer = WrapperProvider.cardManagerWrapper.out.getCardById(data.damageDealerId, true)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.takeDamage(data.damage, false, damageDealer)
        break;
      case Signal.PLAYER_HEAL:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.heal(data.hpToHeal, data.healDown)
        break;
      case Signal.START_TURN:
        await WrapperProvider.turnsManagerWrapper.out.currentTurn!.startTurn()
        break;
      case Signal.PLAYER_ADD_DMG_PREVENTION:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.addDamagePrevention(data.dmgToPrevent, false)
        break;
      case Signal.PLAYER_DIED:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        player._isDead = true
        break;
      case Signal.PLAYER_ADD_CURSE:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        player._curses.push(card)
        break;
      case Signal.PLAYER_SET_RECHARGE_CHAR_AT_START_OF_TURN:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        player?.setRechargeCharacterAtStartOfTurn(data.bool, false)
        break
      case Signal.PLAYER_SET_HAND_SHOW_CARD_BACK:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        player?.hand?.setShowCardsBack(data.isShow, false)
        break
      case Signal.PLAYER_CHANGE_NUM_OF_ITEMS_TO_RECHARGE:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        player?.changeNumOfItemsToRecharge(data.diff, false)
        break
      case Signal.PLAYER_CHANGE_EXTRA_SOULS_NEEDED_TO_WIN:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        player?.changeExtraSoulsNeededToWin(data.diff, false)
        break
      case Signal.CHANGE_PLAYER_ATTACKABLE:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        player?.setCanBeAttacked(data.can, false, data.rollValue)
        break
      // PassiveManager actions.
      case Signal.REMOVE_FROM_PASSIVE_MANAGER:
        try {
          card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true)
          if (!card) { debugger; throw new Error(`No Player Found With Id ${data.cardId}`); }
          WrapperProvider.passiveManagerWrapper.out.removePassiveItemEffects(card, false);
        } catch (error) { }
        break;
      case Signal.REGISTER_PASSIVE_ITEM:
        try {
          card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true)
          if (card != null) { await WrapperProvider.passiveManagerWrapper.out.registerPassiveItem(card, false); }
        } catch (error) { }
        break;
      case Signal.REGISTER_ONE_TURN_PASSIVE_EFFECT:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId);
        cardEffect = card.getComponent(CardEffect)!.getToAddPassiveEffects()[data.effectIndex.index]
        const conditions = cardEffect.getConditions();
        for (let i = 0; i < conditions.length; i++) {
          const conditionData = data.conditionData[i];
          const t = WrapperProvider.dataInerpreterWrapper.out.convertToEffectData(conditionData);
          if (!t) { debugger; throw new Error("Effect Data Null!"); }

          conditions[i].conditionData = t
        }
        await WrapperProvider.passiveManagerWrapper.out.registerOneTurnPassiveEffect(cardEffect, false)
        break;

      case Signal.REMOVE_ONE_TURN_PASSIVE_EFFECT:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId);
        cardEffect = card.getComponent(CardEffect)!.getToAddPassiveEffects()[data.effectIndex.index]
        WrapperProvider.passiveManagerWrapper.out.removeOneTurnPassiveEffect(cardEffect, false)
        break;
      case Signal.END_ROLL_ACTION:
        WrapperProvider.actionManagerWrapper.out.inReactionPhase = false;
        break;
      case Signal.GIVE_PLAYER_PRIORITY:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player Found With Id ${data.playerId}`); }
        await player.givePriority(false)
        break;
      case Signal.GET_REACTION:
        const me = WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!;
        try {
          await me.getResponse(data.activePlayerId)
        } catch (error) {
          WrapperProvider.loggerWrapper.out.error(error)
        }
        break;
      case Signal.RESPOND_TO:
        WrapperProvider.stackWrapper.out.hasOtherPlayerRespond = data.stackEffectResponse;
        whevent.emit(GAME_EVENTS.PLAYER_RESPOND)
        break;
      case Signal.CHOOSE_BUTTON_DATA_COLLECTOR:
        const btns: { btnName: string, btnText: string }[] = data.currentBtns
        for (const btn of btns) {
          WrapperProvider.dataCollectorButtonsManager.out.addButton(btn.btnName, btn.btnText)
        }
        const answer = await WrapperProvider.dataCollectorButtonsManager.out.givePlayerChoice(WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!, false)
        WrapperProvider.serverClientWrapper.out.send(Signal.CHOOSE_BUTTON_DATA_COLLECTOR_RESPONSE, { answer, playerId: data.originPlayerId })
        break;
      case Signal.CHOOSE_BUTTON_DATA_COLLECTOR_RESPONSE:
        whevent.emit(GAME_EVENTS.DATA_COLLECTOR_BUTTON_PRESSED_OTHER_PLAYER, data.answer)
        break;
      case Signal.MAKE_CHOOSE_FROM:
        cardsToChooseFrom = data.cards.map((cid: number) => WrapperProvider.cardManagerWrapper.out.getCardById(cid, true))
        const chooseCard = new ChooseCard();
        chooseCard.flavorText = data.flavorText
        chooseCard.isChooseFromPreviewManager = data.isChooseFromPreviewManager ?? false
        chosenCards = []
        for (let index = 0; index < data.numOfCardsToChoose; index++) {
          const cardChosenData = await chooseCard.requireChoosingACard(cardsToChooseFrom)
          const cardChosen = WrapperProvider.cardManagerWrapper.out.getCardById(cardChosenData.cardChosenId)
          chosenCards.push(cardChosen)
          cardsToChooseFrom.splice(cardsToChooseFrom.indexOf(cardChosen), 1)
        }
        WrapperProvider.serverClientWrapper.out.send(Signal.FINISH_MAKE_CHOOSE_FROM, { playerId: data.originPlayerId, chosenCards: chosenCards.map(c => c.getComponent(Card)!._cardId) })
        break;
      case Signal.FINISH_MAKE_CHOOSE_FROM:
        whevent.emit(GAME_EVENTS.DID_CHOOSE_FROM, data.chosenCards);
        break;
      case Signal.DO_STACK_EFFECT:
        WrapperProvider.stackWrapper.out.replaceStack(data.currentStack.map((stackEffect: any) => converter.convertToStackEffect(stackEffect)), false)
        const newStack = await WrapperProvider.stackWrapper.out.doStackEffectFromTop(false)
        if (newStack != undefined) {
          WrapperProvider.serverClientWrapper.out.send(Signal.FINISH_DO_STACK_EFFECT, { playerId: data.originPlayerId, newStack: newStack.map(effect => effect.convertToServerStackEffect()) })
        } else {
          WrapperProvider.serverClientWrapper.out.send(Signal.FINISH_DO_STACK_EFFECT, { playerId: data.originPlayerId, newStack: WrapperProvider.stackWrapper.out._currentStack.map(effect => effect.convertToServerStackEffect()) })
        }
        break;
      case Signal.FIZZLE_STACK_EFFECT:
        stackEffect = WrapperProvider.stackWrapper.out._currentStack.find(stackEffect => stackEffect.entityId == data.entityId)!
        if (stackEffect) {
          await WrapperProvider.stackWrapper.out.fizzleStackEffect(stackEffect, data.isSilent, false)
        }
        break;
      case Signal.TURN_PLAYER_DO_STACK_EFFECT:
        await WrapperProvider.actionManagerWrapper.out.updateActions()
        break;
      case Signal.UPDATE_RESOLVING_STACK_EFFECTS:
        const stackEffectsToSet = data.stackEffects.map((stackEffect: any) => converter.convertToStackEffect(stackEffect))
        await WrapperProvider.stackWrapper.out.setToCurrentStackEffectResolving(stackEffectsToSet, false)
        break
      case Signal.FINISH_DO_STACK_EFFECT:
        WrapperProvider.stackWrapper.out.newStack = data.newStack.map((stackEffect: any) => converter.convertToStackEffect(stackEffect));
        whevent.emit(GAME_EVENTS.STACK_STACK_EFFECT_RESOLVED_AT_OTHER_PLAYER)
        WrapperProvider.stackWrapper.out.hasStackEffectResolvedAtAnotherPlayer = true;
        break;
      case Signal.UPDATE_STACK_LABLE:
        WrapperProvider.stackLableWrapper.out.updateText(data.stackText)
        break;
      case Signal.STACK_EFFECT_LABLE_CHANGE:
        console.error(`stack effect lable update`)
        stackEffect = WrapperProvider.stackWrapper.out._currentStack.find(se => se.entityId == data.stackId)!
        if (stackEffect) {
          stackEffect._lable = data.text
          console.error(`changed ${stackEffect.name} lable to ${data.text}`)
          console.log(stackEffect._lable)
          console.log(WrapperProvider.stackWrapper.out._currentStack.find(se => se.entityId == data.stackId)!._lable)
        }
        break;
      case Signal.STACK_EMPTIED:
        await WrapperProvider.stackWrapper.out.onStackEmptied()
        break;
      case Signal.PUT_ON_STACK:
        stackEffect = converter.convertToStackEffect(data.stackEffect)
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.originPlayerId)
        if (!player) { debugger; throw new Error(`No Player found ${data.originPlayerId}`); }

        await WrapperProvider.stackWrapper.out.putOnStackFromServer(stackEffect, player)
        // await WrapperProvider.stackWrapper.out.$.onStackEmptied()
        break;
      case Signal.END_PUT_ON_STACK:
        whevent.emit(GAME_EVENTS.PUT_ON_STACK_END)
        // await WrapperProvider.stackWrapper.out.$.onStackEmptied()
        break;
      case Signal.ACTIVATE_PASSIVE:
        const cardActivator = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardActivator);
        if (cardActivator == null) {
          console.log(`shuold not happen!`)
          //   playerActivator.activatePassive(cardActivated, false, passiveIndex);
        } else {

        }
        break;
      case Signal.MOUSE_CURSOR_MOVE:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        const mouseToMove = player!.mouse!
        mouseToMove.tweenThisPos(data.pos.x, data.pos.y)
        break
      // Stack Signals:
      case Signal.NEXT_STACK_ID:
        WrapperProvider.stackWrapper.out.stackEffectsIds += 1;
        break;
      case Signal.REPLACE_STACK:
        await WrapperProvider.stackWrapper.out.replaceStack(data.currentStack.map((stackEffect: any) => converter.convertToStackEffect(stackEffect)), false)
        break;
      case Signal.REMOVE_FROM_STACK:
        converter = new ServerStackEffectConverter();
        stackEffect = converter.convertToStackEffect(data.stackEffect)
        await WrapperProvider.stackWrapper.out.removeAfterResolve(stackEffect, false)
        break;
      case Signal.ADD_TO_STACK:
        converter = new ServerStackEffectConverter();
        stackEffect = converter.convertToStackEffect(data.stackEffect)
        await WrapperProvider.stackWrapper.out.addToStack(stackEffect, false)
        break;
      case Signal.UPDATE_STACK_VIS:
        const stackEffectToUpdate = WrapperProvider.stackWrapper.out._currentStack.find(effect => effect.entityId == data.stackId)!
        //  stackEffectToUpdate.visualRepesentation.flavorText = data.stackVis.flavorText;
        const stackPreview = WrapperProvider.stackEffectVisManagerWrapper.out.getPreviewByStackId(stackEffectToUpdate.entityId)
        if (stackEffectToUpdate && stackPreview) {
          stackPreview.stackEffect = stackEffectToUpdate
          stackPreview.updateInfo(data.text, false)
        }
        break
      case Signal.ADD_SE_VIS_PREV:
        converter = new ServerStackEffectConverter();
        WrapperProvider.stackEffectVisManagerWrapper.out.addPreview(converter.convertToStackEffect(data.stackEffect), false)
        break
      case Signal.REMOVE_SE_VIS_PREV:
        WrapperProvider.stackEffectVisManagerWrapper.out.removePreview(data.stackEffectId, false)
        break
      case Signal.CLEAR_SE_VIS:
        WrapperProvider.stackEffectVisManagerWrapper.out.clearPreviews(false)
        break
      case Signal.UPDATE_STACK_EFFECT:
        converter = new ServerStackEffectConverter();
        stackEffect = converter.convertToStackEffect(data.stackEffect)
        WrapperProvider.stackWrapper.out._currentStack.splice(WrapperProvider.stackWrapper.out._currentStack.findIndex(stackE => stackE.entityId == stackEffect.entityId), 1, stackEffect)
        break
      //

      // Board signals
      case Signal.SET_TURN:
        const turn = WrapperProvider.turnsManagerWrapper.out.getTurnByPlayerId(data.playerId)!
        await WrapperProvider.turnsManagerWrapper.out.setCurrentTurn(turn, false)
        break;
      case Signal.ASSIGN_CHAR_TO_PLAYER:
        console.log(data)
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        let charCard = WrapperProvider.cardManagerWrapper.out.getCardById(data.charCardId, true)
        let itemCard = WrapperProvider.cardManagerWrapper.out.getCardById(data.itemCardId, true)
        itemCard.getComponent(Item)!.eternal = true
        if (!player) { debugger; throw new Error(`No Player found ${data.playerId}`); }
        await player.setCharacter(charCard, itemCard, false)
        break
      case Signal.SET_CHAR:
        player = WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!
        charCard = WrapperProvider.cardManagerWrapper.out.getCardById(data.charCardId, true)
        itemCard = WrapperProvider.cardManagerWrapper.out.getCardById(data.itemCardId, true)
        itemCard.getComponent(Item)!.eternal = true
        await player.setCharacter(charCard, itemCard, true)
        WrapperProvider.serverClientWrapper.out.send(Signal.SET_CHAR_END, { playerId: data.originPlayerId })
        break
      case Signal.SET_CHAR_END:
        whevent.emit(GAME_EVENTS.END_SET_CHAR)
        break
      case Signal.NEW_MONSTER_PLACE:
        await WrapperProvider.monsterFieldWrapper.out.addMonsterToNewPlace(false)
        break;
      case Signal.FLIP_CARD:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true)
        card.getComponent(Card)!.flipCard(false)
        break;
      case Signal.END_BATTLE:
        await WrapperProvider.battleManagerWrapper.out.endBattle(false)
        break
      case Signal.SHOW_DECISION:
        await WrapperProvider.decisionMarkerWrapper.out!.showDecision(WrapperProvider.cardManagerWrapper.out.getCardById(data.startCardId), WrapperProvider.cardManagerWrapper.out.getCardById(data.endCardId), false, data.flipEndCard)
        break
      case Signal.SET_STACK_ICON:
        await WrapperProvider.decisionMarkerWrapper.out!.setStackIcon(WrapperProvider.stackEffectVisManagerWrapper.out.stackIcons[data.iconIndex], false)
        break
      case Signal.SHOW_STACK_EFFECT:
        await WrapperProvider.decisionMarkerWrapper.out!.showStackEffect(data.effectId, false)
        break
      case Signal.SHOW_DICE_ROLL:
        const diceRoll = WrapperProvider.stackWrapper.out._currentStack.find(stack => stack.entityId == data.stackId) as AttackRoll | RollDiceStackEffect
        diceRoll.visualRepesentation.extraSprite = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(diceRoll.creatorCardId)!.dice!.diceSprite!.spriteFrame!
        await WrapperProvider.decisionMarkerWrapper.out!.showDiceRoll(diceRoll, false)
        break
      case Signal.SHOW_EFFECT_CHOSEN:
        await WrapperProvider.decisionMarkerWrapper.out!.showEffectFromServer(WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId), data.pos, data.size)
        break
      //

      // eden signals
      case Signal.CHOOSE_FOR_EDEN:

        treasureDeck.shuffleDeck()

        // filter eden available cards:
        let cardsNotFiltered = true
        cardsToChooseFrom = []
        let i = 0
        do {
          const cardToChoose = treasureDeck.getCards()[i];
          if (cardToChoose.getComponent(CardEffect)!.hasDestroySelfEffect) {
          } else {
            cardsToChooseFrom.push(cardToChoose)
            if (cardsToChooseFrom.length == 3) {
              cardsNotFiltered = true;
              break;
            }
          }
          i++;
          if (i > treasureDeck.getCardsLength() - 1) { console.error(`i is bigger than cards length, not possible!`) }
        } while (cardsNotFiltered);
        cardsToChooseFrom.forEach(c => c.getComponent(Card)!.flipCard(false))
        chosenCards = await WrapperProvider.cardPreviewManagerWrapper.out.selectFromCards(cardsToChooseFrom, 1)
        cardsToChooseFrom.forEach(c => c.getComponent(Card)!.flipCard(false))
        const chosen = chosenCards.pop()
        if (chosen) {
          WrapperProvider.serverClientWrapper.out.send(Signal.EDEN_CHOSEN, { cardId: chosen.getComponent(Card)!._cardId, playerId: data.originPlayerId })
        } else {
          WrapperProvider.loggerWrapper.out.error(`No card was chosen for eden`)
        }
        break;
      case Signal.EDEN_CHOSEN:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        WrapperProvider.playerManagerWrapper.out.edenChosenCard = card;
        WrapperProvider.playerManagerWrapper.out.edenChosen = true
        whevent.emit(GAME_EVENTS.EDEN_WAS_CHOSEN)
        break;

      ///

      // ActionLable Signals
      case Signal.ACTION_MASSAGE_ADD:
        const massage = new ActionMessage(data.massage._id, data.massage._text);
        WrapperProvider.actionLableWrapper.out.putMassage(massage, data.childOfId)
        break;
      case Signal.ACTION_MASSAGE_REMOVE:
        WrapperProvider.actionLableWrapper.out.removeMessage(data.id, false)
        break;
      ///

      //Announcement Lalbe
      case Signal.SHOW_ANNOUNCEMENT:
        WrapperProvider.announcementLableWrapper.out.showAnnouncement(data.text, 0, false)
        break;
      case Signal.HIDE_ANNOUNCEMENT:
        WrapperProvider.announcementLableWrapper.out.hideAnnouncement(false)
        break;
      case Signal.SHOW_TIMER:
        WrapperProvider.announcementLableWrapper.out.showTimer(data.time, false)
        break;
      case Signal.HIDE_TIMER:
        WrapperProvider.announcementLableWrapper.out.hideTimer(false)
        break;

      // Particle Effect Signals
      case Signal.ACTIVATE_PARTICLE_EFFECT:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        WrapperProvider.particleManagerWrapper.out.activateParticleEffect(card, data.particleType, false)
        break;
      case Signal.DISABLE_PARTICLE_EFFECT:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        WrapperProvider.particleManagerWrapper.out.disableParticleEffect(card, data.particleType, false)
        break;
      case Signal.SHOW_REACTIONS:
        // let c: number[] = data.cardsIds;
        // cards.set(c.map(id => { console.log(id); return WrapperProvider.cardManagerWrapper.out.getCardById(id) }))
        // for (const card of cards.getCards()) {
        //   animationManagerWrapper._am.showAnimation(card, ANIM_COLORS.BLUE)
        // }
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player found ${data.playerId}`); }
        WrapperProvider.animationManagerWrapper.out.showAnimation(player.character!, ANIM_COLORS.RED)
        break;
      case Signal.REACTION_TOGGLED:
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player found ${data.playerId}`); }
        // player._reactionToggle.toggleThis(false)
        if (player._reactionToggle!.isChecked) {
          player._reactionToggle!.uncheck(false)
        } else {
          player._reactionToggle!.check(false)
        }
        break
      case Signal.HIDE_REACTIONS:
        // cards.set(data.cardsIds.map(id => { WrapperProvider.cardManagerWrapper.out.getCardById(id) }))
        // for (const card of cards.getCards()) {
        //   animationManagerWrapper._am.endAnimation(card)
        // }
        player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.playerId)
        if (!player) { debugger; throw new Error(`No Player found ${data.playerId}`); }
        WrapperProvider.animationManagerWrapper.out.endAnimation(player.character!)
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
          WrapperProvider.passiveManagerWrapper.out.updatePassiveMethodData(serverPassiveData.convertToPassiveMeta(), data.isAfterActivation, false)
        } else {
          throw new Error("No Data Found!");

          // passiveManagerWrapper._pm.updatePassiveMethodData(null, data.isAfterActivation, false)
        }
        break;
      case Signal.CLEAR_PASSIVE_DATA:
        WrapperProvider.passiveManagerWrapper.out.clearPassiveMethodData(data.index, data.isAfterActivation, false)
        break;
      ///

      case Signal.SET_CONCURENT_EFFECT_DATA:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        const effectData = WrapperProvider.dataInerpreterWrapper.out.convertToEffectData(data.effectData)
        if (!effectData) { debugger; throw new Error("No Effect Data Could Be Created"); }
        cardEffectComp = card.getComponent(CardEffect)!
        const num = data.numOfEffect;
        const type = data.type;
        const effect = cardEffectComp.getEffectByNumAndType(num, type)!
        effect.runDataConcurency(effectData, num, type, false)
        break
      case Signal.MARK_EFFECT_AS_RUNNING:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId)
        cardEffectComp = card.getComponent(CardEffect)!
        cardEffect = cardEffectComp.getEffectByNumAndType(data.effectIndex, data.effectType)!
        cardEffect.effectRunning = data.effectType == "true"
        break;
      case Signal.DECK_ARRAGMENT:
        data.arrangement.map((id: number) => cards.push(id))
        const deckToSet = WrapperProvider.cardManagerWrapper.out.getDeckByType(data.deckType)
        deckToSet.getComponent(Deck)!.setDeckCards(cards)
        break;
      case Signal.CARD_GET_COUNTER:
        card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true)
        card.getComponent(Card)!._counters += data.numOfCounters
        break;
      default:
        WrapperProvider.loggerWrapper.out.error(`Recived Signal ${signal} but no Definition In ActionManager`)
        break;
    }

  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    const mainScript = WrapperProvider.MainScriptNode
    this.turnsManager = find("TurnsManager", mainScript);

    this.playersManager = find("PlayerManager", mainScript);

    this.cardManager = find("CardManager", mainScript);

    this.decks = WrapperProvider.cardManagerWrapper.out.getAllDecks();

    this.ButtonManager = find("ButtonManager", mainScript);

    this.pileManager = find("PileManager", mainScript);

    // //set up turn change listener
    // this.node.parent.on("turnChanged", this.updateAfterTurnChange, this);

    // whevent.on(GAME_EVENTS.STACK_EMPTIED, WrapperProvider.actionManagerWrapper.out.checkForDeadEntities)

    // TODO expand to includ all of the turn plays (buying,fighting,playing loot card)
    // TODO dont forget to exlude all available reactions from all other players when available!
  }



  // update (dt) {}
}

