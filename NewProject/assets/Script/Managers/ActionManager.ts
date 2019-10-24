
import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import { CARD_TYPE, ROLL_TYPE, BUTTON_STATE, GAME_EVENTS } from "../Constants";
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
import MainScript from "../MainScript";
import { getCurrentPlayer, Turn } from "../Modules/TurnsModule";
import ServerStackEffectConverter from "../StackEffects/ServerSideStackEffects/ServerStackEffectConverter";
import { ServerEffect } from "./../Entites/ServerCardEffect";
import BattleManager from "./BattleManager";
import ButtonManager from "./ButtonManager";
import CardManager from "./CardManager";
import CardPreviewManager from "./CardPreviewManager";
import DataInterpreter, { ActiveEffectData, PassiveEffectData } from "./DataInterpreter";
import PassiveManager, { ServerPassiveMeta } from "./PassiveManager";
import PileManager from "./PileManager";
import PlayerManager from "./PlayerManager";
import StackEffectVisManager from "./StackEffectVisManager";
import TurnsManager from "./TurnsManager";


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
    var currentPlayerHand: cc.Node = currentPlayerComp.hand.node
    var currentPlayerHandComp: CardLayout = currentPlayerHand.getComponent(
      CardLayout
    );


    cc.log(`attack plays: ${TurnsManager.currentTurn.attackPlays}`)
    cc.log(`buy plays: ${TurnsManager.currentTurn.buyPlays}`)
    cc.log(`loot plays ${TurnsManager.currentTurn.lootCardPlays}`)
    cc.log('in Battle Phase:' + TurnsManager.currentTurn.battlePhase)
    if (Stack._currentStack.length == 0 && currentPlayerComp._Hp > 0) {
      //if (!ActionManager.inReactionPhase && currentPlayerComp.Hp > 0) {

      //make next turn btn available 
      ButtonManager.enableButton(ButtonManager.$.nextTurnButton, BUTTON_STATE.ENABLED)
      // ButtonManager.nextTurnButton.getComponent(cc.Button).interactable = true;

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
        //make store cards buyable (add check for money)
        if (
          TurnsManager.currentTurn.buyPlays > 0
          //&& player.getComponent(Player).coins >= 10
        ) {
          for (let i = 0; i < Store.storeCards.length; i++) {
            const storeCard = Store.storeCards[i];
            if (player.getComponent(Player).coins >= Store.storeCardsCost) {
              CardManager.makeItemBuyable(storeCard, currentPlayerComp);
            }
          }

          if (treasureDeck.topBlankCard != null) {
            let treasureDeckTopCard = treasureDeck.topBlankCard;
            if (player.getComponent(Player).coins >= Store.topCardCost) {

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
          try {

            if (item.getComponent(CardEffect).testEffectsPreConditions()) {
              CardManager.makeItemActivateable(item.node);
            } else {
              CardManager.disableCardActions(item.node);

            }
          } catch (error) {
            cc.error(error)
            Logger.error(error)
          }
        }
        player.getComponent(Player).dice.getComponent(Dice).disableRoll();

        //if in battle phase do battle
      } else {
        cc.log(`in battle phase do battle`)

        //if the monster is not dead
        // 
        //enable activating items
        ButtonManager.enableButton(ButtonManager.$.nextTurnButton, BUTTON_STATE.DISABLED)
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
              .getComponent(Player).dice
              .addRollAction(ROLL_TYPE.FIRST_ATTACK);
            //if its not the first attack
          } else {
            player.getComponent(Player).dice.addRollAction(ROLL_TYPE.ATTACK);
          }


        } else {
          cc.log(`currently attacked monster has 0 hp`)

          ActionManager.inReactionPhase
          ButtonManager.enableButton(ButtonManager.$.nextTurnButton, BUTTON_STATE.DISABLED)

        }
        return new Promise((resolve, reject) => {
          resolve(true)
        })
      }
    }
  }


  static updateActionsForNotTurnPlayer(player: cc.Node) {
    this.decks = CardManager.getAllDecks();
    let lootDeck = CardManager.lootDeck.getComponent(Deck);

    //update player reactions:
    player.getComponent(Player).calculateReactions();
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
        if (!card._isFlipped) card.flipCard(false)
        CardManager.disableCardActions(card.node);
      }
    }

    //set up components
    //disable next turn btn
    ButtonManager.enableButton(ButtonManager.$.nextTurnButton, BUTTON_STATE.DISABLED)

    //Set up listener to card selected
    return true
  }


  static isUpdateActionsRunning = false;

  static async updateActions() {


    await CardManager.updatePlayerCards();

    await CardManager.updateOnTableCards();

    await CardManager.checkForEmptyFields();



    if (TurnsManager.getCurrentTurn().getTurnPlayer().playerId == PlayerManager.mePlayer.getComponent(Player).playerId) {

      await CardManager.updatePassiveListeners();

      await this.updateActionsForTurnPlayer(TurnsManager.getCurrentTurn().getTurnPlayer().node);

    } else {

      await this.updateActionsForNotTurnPlayer(PlayerManager.mePlayer);

    }

  }

  async updateAfterTurnChange() {
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
    await ActionManager.updateActions();
  }


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
    let converter = new ServerStackEffectConverter();
    switch (signal) {
      //Actions from a player,without reaction
      case Signal.DISCARD_LOOT:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId, true);
        await player.discardLoot(card, false);
        // ActionManager.updateActions();
        break;
      case Signal.NEW_MONSTER_ON_PLACE:
        let monsterField = cc
          .find("Canvas/MonsterField")
          .getComponent(MonsterField);
        let newMonster = CardManager.getCardById(data.cardId, true);
        let monsterDeck = CardManager.monsterDeck.getComponent(Deck);
        let monsterIndex = monsterDeck._cards.indexOf(newMonster)
        if (monsterIndex != -1) {
          monsterDeck._cards.splice(monsterIndex, 1);
        }
        MonsterField.addMonsterToExsistingPlace(
          data.monsterPlaceId,
          newMonster,
          false
        );
        break;
      case Signal.SHOW_CARD_PREVIEW:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardToShowId, true);
        //add a lable with who is selecting.
        CardPreviewManager.getPreviews(Array.of(card), true);
        break;
      case Signal.ACTIVATE_ITEM:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId);
        cc.log(`should not happen`)
        //  let itemActivated = await player.activateItem(card, false);
        break;
      case Signal.ROLL_DICE:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        player.dice.activateRollAnimation();
        break;
      case Signal.ROLL_DICE_ENDED:

        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        player.dice.endRollAnimation();
        player.dice.setRoll(data.numberRolled);
        break;
      case Signal.MOVE_CARD:
        card = CardManager.getCardById(data.cardId, true)

        place = PlayerManager.getPlayerById(data.placeID)

        if (place != null) {
          if (card.getComponent(Card).type == CARD_TYPE.LOOT) {
            place = place.getComponent(Player).hand.node;
          } else {
            place = place.getComponent(Player).desk.node;
          }
        }
        if (place == null) {
          place = CardManager.getCardById(data.placeID, true)

        }

        await CardManager.moveCardTo(card, place, false, data.flipIfFlipped, data.moveIndex, data.firstPos, data.playerId)
        break;
      case Signal.MOVE_CARD_END:
        CardManager.receiveMoveCardEnd(data.moveIndex)
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
        let currentTurnPlayer = PlayerManager.getPlayerById(
          TurnsManager.getCurrentTurn().PlayerId
        );
        currentTurnPlayer.getComponent(Player).endTurn(false);
        break;
      case Signal.MOVE_CARD_TO_PILE:
        card = CardManager.getCardById(data.cardId, true);
        PileManager.addCardToPile(data.type, card, false);
        break;
      case Signal.GET_SOUL:
        card = CardManager.getCardById(data.cardId, true);
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        player.getSoulCard(card, false)
        break;
      case Signal.LOSE_SOUL:
        card = CardManager.getCardById(data.cardId, true);
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        player.loseSoul(card, false)
        break;

      //On Monster Events
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


      //Monster holder actions
      case Signal.GET_NEXT_MONSTER:
        monsterHolder = MonsterField.getMonsterPlaceById(data.monsterPlaceId);
        monsterHolder.getNextMonster(false);
        break;
      case Signal.ADD_MONSTER:
        cc.log(data)
        monsterHolder = MonsterField.getMonsterPlaceById(data.monsterPlaceId);

        card = CardManager.getCardById(data.monsterId, true)
        monsterHolder.addToMonsters(card, false);
        break;
      case Signal.REMOVE_MONSTER:
        monsterHolder = MonsterField.getMonsterPlaceById(data.holderId);
        card = CardManager.getCardById(data.monsterId, true)
        monsterHolder.removeMonster(card, false);
        break;

      // Deck actions
      case Signal.CARD_DRAWN:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.drawnCardId, true)
        deck = CardManager.getDeckByType(data.deckType).getComponent(Deck);
        player.drawCard(deck.node, false, card);
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
      case Signal.BUY_ITEM_FROM_SHOP:
        card = CardManager.getCardById(data.cardId, true)
        Store.$.buyItemFromShop(card, false);

        break;

      // OnPlayer actions

      case Signal.PLAY_LOOT_CARD:

        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId, true);
        player.playLootCard(card, false);
        break;
      // case Signal.PLAY_LOOT_CARD:

      //   player = PlayerManager.getPlayerById(data.playerId).getComponent(
      //     Player
      //   );
      //   card = CardManager.getCardById(data.cardId, true);
      //   player.loseLoot(card, false);
      //   break;

      case Signal.ADD_AN_ITEM:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId, true);
        await player.addItem(card, false, data.isReward);
        break;
      case Signal.PLAYER_RECHARGE_ITEM:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        card = CardManager.getCardById(data.cardId, true);
        player.rechargeItem(card, false);
        break;
      case Signal.DECLARE_ATTACK:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(
          Player
        );
        let attackedMonster = CardManager.getCardById(
          data.attackedMonsterId,
          true
        );
        player.declareAttack(attackedMonster, false, data.cardHolderId);
        break;
      case Signal.PLAYER_GET_LOOT:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        card = CardManager.getCardById(data.cardId, true);
        player.gainLoot(card, false)
        break;
      case Signal.PLAYER_LOSE_LOOT:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        card = CardManager.getCardById(data.cardId, true);
        player.loseLoot(card, false)
        break;
      case Signal.CHANGE_MONEY:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        player.changeMoney(data.numOfCoins, false)
        break;
      case Signal.SET_MONEY:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        player.setMoney(data.numOfCoins, false)
        break;
      case Signal.PLAYER_GAIN_HP:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.gainHeartContainer(data.hpToGain, data.isTemp, false)
        break;
      case Signal.PLAYER_GAIN_DMG:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.gainDMG(data.DMGToGain, data.isTemp, false)
        break;
      case Signal.PLAYER_GAIN_ROLL_BONUS:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.gainRollBonus(data.bonusToGain, data.isTemp, false)
        break;

      case Signal.PLAYER_GAIN_ATTACK_ROLL_BONUS:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.gainAttackRollBonus(data.bonusToGain, data.isTemp, false)
        break;

      case Signal.PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.gainFirstAttackRollBonus(data.bonusToGain, data.isTemp, false)
        break;

      case Signal.PLAYER_GET_HIT:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        damageDealer = CardManager.getCardById(data.damageDealerId, true)
        await player.getHit(data.damage, false, damageDealer)
        break;
      case Signal.PLAYER_HEAL:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.heal(data.hpToHeal, false)
        break;
      case Signal.START_TURN:
        // player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        TurnsManager.currentTurn.startTurn()
        break;
      case Signal.PLAYER_ADD_DMG_PREVENTION:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.addDamagePrevention(data.dmgToPrevent, false)
        break;
      //PassiveManager actions.
      case Signal.REGISTER_PASSIVE_ITEM:
        card = CardManager.getCardById(data.cardId, true)
        if (card != null) PassiveManager.registerPassiveItem(card, false);
        break;

      case Signal.REGISTER_ONE_TURN_PASSIVE_EFFECT:
        card = CardManager.getCardById(data.cardId);
        let cardEffect = card.getComponent(CardEffect).toAddPassiveEffects[data.effectIndex.index].getComponent(Effect)
        let conditionsData = [];
        for (let i = 0; i < cardEffect.conditions.length; i++) {
          const condition = cardEffect.conditions[i];
          let conditionData = data.conditionData[i];
          //conditionsData.push(DataInterpreter.convertToEffectData(conditionData))
          let t = DataInterpreter.convertToEffectData(conditionData);
          cc.error(`register one turn passive, condition ${condition.name}`)
          cc.log(t)
          cardEffect.conditions[i].conditionData = t
        }
        //  let conditionData = DataInterpreter.convertToActiveEffectData(data.conditionData)
        //cardEffect.conditions.conditionData = conditionData;
        PassiveManager.registerOneTurnPassiveEffect(cardEffect, false)
        break;

      //Part of Reaction system. get reaction from a player
      case Signal.END_ROLL_ACTION:
        ActionManager.inReactionPhase = false;
        break;

      case Signal.GIVE_PLAYER_PRIORITY:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        await player.givePriority(false)
        break;
      case Signal.GET_REACTION:

        let me = PlayerManager.mePlayer.getComponent(Player);

        await me.getResponse(data.activePlayerId)
        break;
      case Signal.RESPOND_TO:
        Stack.hasOtherPlayerRespond = data.stackEffectResponse;
        whevent.emit(GAME_EVENTS.PLAYER_RESPOND)
        //Stack.hasOtherPlayerRespondedYet = true;
        break;
      case Signal.DO_STACK_EFFECT:

        Stack.replaceStack(data.currentStack.map(stackEffect => converter.convertToStackEffect(stackEffect)), false)
        cc.log(`stack after replacing`)
        cc.log(Stack._currentStack)
        let newStack = await Stack.doStackEffectFromTop(false)
        cc.log(`new stack after doing effect`)
        cc.log(newStack)
        cc.log(Stack._currentStack)
        if (newStack != undefined) {
          ServerClient.$.send(Signal.FINISH_DO_STACK_EFFECT, { playerId: data.originPlayerId, newStack: newStack.map(effect => effect.convertToServerStackEffect()) })
        } else {
          ServerClient.$.send(Signal.FINISH_DO_STACK_EFFECT, { playerId: data.originPlayerId, newStack: Stack._currentStack.map(effect => effect.convertToServerStackEffect()) })
        }
        break;
      case Signal.TURN_PLAYER_DO_STACK_EFFECT:
        await ActionManager.updateActions()
        break;

      case Signal.ADD_RESOLVING_STACK_EFFECT:
        let stackEffectToAdd = converter.convertToStackEffect(data.stackEffect)
        await Stack.addToCurrentStackEffectResolving(stackEffectToAdd, false)
        break
      case Signal.REMOVE_RESOLVING_STACK_EFFECT:
        let stackEffectToRemove = converter.convertToStackEffect(data.stackEffect)
        await Stack.removeFromCurrentStackEffectResolving(stackEffectToRemove, false)
        break
      case Signal.FINISH_DO_STACK_EFFECT:
        // await Stack.replaceStack(data.newStack.map(stackEffect => converter.convertToStackEffect(stackEffect)), true)
        Stack.newStack = data.newStack.map(stackEffect => converter.convertToStackEffect(stackEffect));
        whevent.emit(GAME_EVENTS.STACK_STACK_EFFECT_RESOLVED_AT_OTHER_PLAYER)
        Stack.hasStackEffectResolvedAtAnotherPlayer = true;
        break;
      case Signal.ACTIVATE_PASSIVE:
        let cardActivated = CardManager.getCardById(data.cardId);
        let passiveIndex = data.passiveIndex;
        let cardActivator = CardManager.getCardById(data.cardActivator);
        if (cardActivator == null) {
          let playerActivator = PlayerManager.getPlayerByCardId(
            data.cardActivator
          );
          cc.log(`shuold not happen!`)
          //   playerActivator.activatePassive(cardActivated, false, passiveIndex);
        } else {

        }

        break;


      //Stack Signals:
      case Signal.NEXT_STACK_ID:
        Stack.stackEffectsIds += 1;
        break;
      case Signal.REPLACE_STACK:
        await Stack.replaceStack(data.currentStack.map(stackEffect => converter.convertToStackEffect(stackEffect)), false)
        break;
      case Signal.REMOVE_FROM_STACK:
        // await Stack.removeFromTopOfStack(false)
        converter = new ServerStackEffectConverter();
        let stackEffect = converter.convertToStackEffect(data.stackEffect)
        await Stack.removeAfterResolve(stackEffect, false)
        break;

      case Signal.ADD_TO_STACK:
        converter = new ServerStackEffectConverter();
        // let stackEffectType = data.stackEffect.stackEffectType
        stackEffect = converter.convertToStackEffect(data.stackEffect)
        await Stack.addToStack(stackEffect, false)
        break;
      case Signal.UPDATE_STACK_VIS:
        let stackEffectToUpdate = Stack._currentStack.find(effect => effect.entityId == data.stackId)
        stackEffectToUpdate.visualRepesentation.flavorText = data.stackVis.flavorText;
        let stackPreview = StackEffectVisManager.$.getPreviewByStackId(stackEffectToUpdate.entityId)
        stackPreview.stackEffect = stackEffectToUpdate
        stackPreview.updateInfo(false)

        break
      //
      //Board signals
      case Signal.SET_TURN:
        let turn = TurnsManager.getTurnByPlayerId(data.playerId)
        TurnsManager.setCurrentTurn(turn, false)
        break;
      case Signal.ASSIGN_CHAR_TO_PLAYER:
        player = PlayerManager.getPlayerById(data.playerId).getComponent(Player)
        let charCard = CardManager.getCardById(data.charCardId, true)
        let itemCard = CardManager.getCardById(data.itemCardId, true)
        itemCard.getComponent(Item).eternal = true
        player.assignChar(charCard, itemCard)
        break
      case Signal.NEW_MONSTER_PLACE:
        MonsterField.addMonsterToNewPlace(false)
        break;

      case Signal.FLIP_CARD:
        card = CardManager.getCardById(data.cardId, true)
        card.getComponent(Card).flipCard(false)
        break;
      case Signal.CANCEL_ATTACK:
        await BattleManager.cancelAttack(false)
        break
      //


      //eden signals
      case Signal.CHOOSE_FOR_EDEN:
        CardManager.treasureDeck.getComponent(Deck).shuffleDeck()
        let cardsToChooseFrom = CardManager.treasureDeck.getComponent(Deck)._cards.filter((card, index, array) => { if (index == array.length - 1 || index == array.length - 2 || index == array.length - 3) return true })
        let chosenCards = await CardPreviewManager.selectFromCards(cardsToChooseFrom, 1)
        let chosen = chosenCards.pop()
        if (chosen) {
          ServerClient.$.send(Signal.EDEN_CHOSEN, { cardId: chosen.getComponent(Card)._cardId, sendToPlayerId: data.originPlayerId })
        }
        //  player = PlayerManager.getPlayerById(data.originalPlayerId).getComponent(Player)
        break;
      case Signal.EDEN_CHOSEN:
        card = CardManager.getCardById(data.cardId)
        //  player = PlayerManager.getPlayerById(data.originalPlayerId).getComponent(Player)
        PlayerManager.edenChosenCard = card;
        PlayerManager.edenChosen = true
        whevent.emit(GAME_EVENTS.EDEN_WAS_CHOSEN)
        break;


      //Action Lable Signals
      case Signal.ACTION_MASSAGE:
        let massage = data.massage;
        let time = data.timeToDisappear;
        ActionLable.$.putMassage(massage, time)
        break;
      ///



      case Signal.UPDATE_PASSIVE_DATA:
        let newData = data.passiveData;
        if (newData) {
          let serverPassiveData = new ServerPassiveMeta
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

      case Signal.DECK_ARRAGMENT:
        let cards = data.arrangement.map(id => CardManager.getCardById(id, true))
        let deckToSet = CardManager.getDeckByType(data.deckType)
        deckToSet.getComponent(Deck).setDeckCards(cards)
        break;

      case Signal.CARD_GET_COUNTER:
        card = CardManager.getCardById(data.cardId, true)
        card.getComponent(Card)._counters += data.numOfCounters
        break;
      default:

        break;
    }
    //this.updateActions()
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
