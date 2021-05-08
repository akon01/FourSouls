import { Component, Label, Node, Prefab, Sprite, UITransform, Widget, _decorator } from 'cc';
import { Signal } from "../../../Misc/Signal";
import { whevent } from "../../../ServerClient/whevent";
import { ChooseCard } from "../../CardEffectComponents/DataCollector/ChooseCard";
import { AddEggCounters, IEggCounterable, RemoveEggCounters } from '../../CardEffectComponents/IEggCounterable';
import { MultiEffectChoose } from "../../CardEffectComponents/MultiEffectChooser/MultiEffectChoose";
import { ANNOUNCEMENT_TIME, BUTTON_STATE, CARD_TYPE, CHOOSE_CARD_TYPE, GAME_EVENTS, ITEM_TYPE, PARTICLE_TYPES, PASSIVE_EVENTS, ROLL_TYPE, SOULS_NEEDED_TO_WIN, TIME_TO_REACT_ON_ACTION } from "../../Constants";
import { ANIM_COLORS } from "../../Managers/AnimationManager";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { ActivateItem } from "../../StackEffects/ActivateItem";
import { AttackRoll } from "../../StackEffects/AttackRoll";
import { DeclareAttack } from "../../StackEffects/DeclareAttack";
import { PlayerDeath } from "../../StackEffects/PlayerDeath";
import { PlayLootCardStackEffect } from "../../StackEffects/PlayLootCard";
import { PurchaseItem } from "../../StackEffects/PurchaseItem";
import { StartTurnLoot } from "../../StackEffects/StartTurnLoot";
import { CardEffect } from "../CardEffect";
import { CardLayout } from "../CardLayout";
import { Character } from "../CardTypes/Character";
import { Item } from "../CardTypes/Item";
import { Monster } from "../CardTypes/Monster";
import { IAttackableEntity } from '../IAttackableEntity';
import { PlayerDesk } from "../PlayerDesk";
import { ReactionToggle } from "../ReactionToggle";
import { Card } from "./Card";
import { Deck } from "./Deck";
import { Dice } from "./Dice";
import { Mouse } from './Mouse';

const { ccclass, property } = _decorator;


@ccclass('Player')
export class Player extends Component implements IEggCounterable, IAttackableEntity {
      getCanBeAttacked(): boolean {
            return this._canBeAttacked
      }
      _isAttacked = false;
      getCurrentHp(): number {
            return this._Hp
      }
      getRollValue(): number {
            return this._rollValue
      }
      getRollBonus(): number {
            return this._rollBonus
      }

      private _rollValue = 1
      _rollBonus = 0
      private _canBeAttacked = false

      setCanBeAttacked(can: boolean, sendToServer: boolean, rollValue?: number) {
            this._canBeAttacked = can
            this._rollValue = rollValue ? rollValue : 1
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.CHANGE_PLAYER_ATTACKABLE, { playerId: this.playerId, can, rollValue: rollValue })

            }
      }

      getEggCounters(): number {
            return this.character!.getComponent(Card)!.eggCounters
      }


      async addEggCounters(numToChange: number, sendToServer: boolean): Promise<void> {
            let cardId: number | undefined = undefined
            let scope: Node | undefined = undefined
            if (sendToServer) {
                  cardId = this.character?.getComponent(Card)?._cardId
                  scope = this.node
            }
            await AddEggCounters(numToChange, this.character!.getComponent(Card)!, sendToServer, cardId, scope)
      }

      async removeEggCounters(numToChange: number, sendToServer: boolean): Promise<void> {
            let cardId: number | undefined = undefined
            let scope: Node | undefined = undefined
            if (sendToServer) {
                  cardId = this.character?.getComponent(Card)?._cardId
                  scope = this.node
            }
            await RemoveEggCounters(numToChange, this.getEggCounters(), this.character!.getComponent(Card)!, sendToServer, cardId, scope)
      }


      @property
      playerId = 0;

      @property
      playerServerId = 0;

      @property(Node)
      handNode: Node | null = null;

      @property(Component)
      hand: CardLayout | null = null;

      @property(Prefab)
      mousePrefab: Prefab | null = null

      mouse: Mouse | null = null

      private handCards: Set<number> = new Set()


      getHandCards() {
            return Array.from(this.handCards.values()).map(cid => WrapperProvider.cardManagerWrapper.out.getCardById(cid))
      }

      addHandCards(cards: Node[]) {
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.handCards.add(card)
            });
      }

      setHandCards(cards: Node[]) {
            this.handCards.clear()
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.handCards.add(card)
            });
      }
      removeFromHandCards(cards: Node[]) {
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.handCards.delete(card)
            });
      }

      dice: Dice | null = null;

      @property(Node)
      selectedCard: Node | null = null;


      character: Node | null = null;


      characterItem: Node | null = null;


      activeItems: Set<number> = new Set()

      getActiveItems() {

            return Array.from(this.activeItems.values()).map(cid => WrapperProvider.cardManagerWrapper.out.getCardById(cid))
      }

      addActiveItems(cards: Node[]) {

            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.activeItems.add(card)
            });
      }

      setActiveItems(cards: Node[]) {

            this.activeItems.clear()
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.activeItems.add(card)
            });
      }
      removeFromActiveItems(cards: Node[]) {
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.activeItems.delete(card)
            });
      }


      private passiveItems: Set<number> = new Set()

      getPassiveItems() {

            return Array.from(this.passiveItems.values()).map(cid => WrapperProvider.cardManagerWrapper.out.getCardById(cid))
      }

      addPassiveItems(cards: Node[]) {
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.passiveItems.add(card)
            });
      }

      setPassiveItems(cards: Node[]) {
            this.passiveItems.clear()
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.passiveItems.add(card)
            });
      }
      removeFromPassiveItems(cards: Node[]) {
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.passiveItems.delete(card)
            });
      }



      private paidItems: Set<number> = new Set()

      getPaidItems() {

            return Array.from(this.paidItems.values()).map(cid => WrapperProvider.cardManagerWrapper.out.getCardById(cid))
      }

      addPaidItems(cards: Node[]) {
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.paidItems.add(card)
            });
      }

      setPaidItems(cards: Node[]) {
            this.paidItems.clear()
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.paidItems.add(card)
            });
      }
      removeFromPaidItems(cards: Node[]) {
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.paidItems.delete(card)
            });
      }



      desk: PlayerDesk | null = null;


      soulsLayout: Node | null = null;


      souls = 0;


      private soulCards: Set<number> = new Set()

      getSoulCards() {
            return Array.from(this.soulCards.values()).map(cid => WrapperProvider.cardManagerWrapper.out.getCardById(cid))
      }

      addSoulCards(cards: Node[]) {
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.soulCards.add(card)
            });
      }

      setSoulCards(cards: Node[]) {
            this.soulCards.clear()
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.soulCards.add(card)
            });
      }
      removeFromSoulCards(cards: Node[]) {
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.soulCards.delete(card)
            });
      }

      @property
      private _extraSoulsNeededToWin = 0;

      getExtraSoulsNeededToWin() {
            return this._extraSoulsNeededToWin
      }

      changeExtraSoulsNeededToWin(diff: number, sendToServer: boolean) {
            this._extraSoulsNeededToWin += diff
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.PLAYER_CHANGE_EXTRA_SOULS_NEEDED_TO_WIN, { playerId: this.playerId, diff })
            }
      }

      setExtraSoulsNeededToWin(quantity: number, sendToServer: boolean) {
            const diff = quantity - this._extraSoulsNeededToWin
            this.changeExtraSoulsNeededToWin(diff, sendToServer)
      }

      @property
      _putCharLeft = false;

      private deskCards: Set<number> = new Set()

      getDeskCards() {
            return Array.from(this.deskCards.values()).map(cid => WrapperProvider.cardManagerWrapper.out.getCardById(cid))
      }

      addDeskCards(cards: Node[]) {
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.deskCards.add(card)
            });
      }

      setDeskCards(cards: Node[]) {
            this.deskCards.clear()
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.deskCards.add(card)
            });
      }
      removeFromDeskCards(cards: Node[]) {
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.deskCards.delete(card)
            });
      }

      private lootCardPlays = 0;

      getLootCardPlays() {
            return this.lootCardPlays
      }

      changeLootCardPlayes(diff: number, sendToServer: boolean) {
            this.lootCardPlays += diff
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.PLAYER_CHANGE_LOOT_CARD_PLAYS, { playerId: this.playerId, diff })
            }
      }

      setLootCardPlays(quantity: number, sendToServer: boolean) {
            const diff = quantity - this.lootCardPlays
            this.changeLootCardPlayes(diff, sendToServer)
      }

      @property
      turnDrawPlays = 1;

      changeTurnDrawPlays(quantityToChange: number, sendToServer: boolean) {
            this.turnDrawPlays += quantityToChange
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.CHANGE_TURN_DRAW_PLAYS, { playerId: this.playerId, quantityToChange })
            }
      }

      @property
      buyPlays = 0;

      @property
      attackPlays = 0;

      @property
      _attackDeckPlays = 0;

      @property
      _mustAttackPlays = 0;

      @property
      _mustAttackMonsters: Monster[] = []

      @property
      _mustDeckAttackPlays = 0;

      @property
      coins = 0;

      @property
      _Hp = 0;

      @property
      _lastHp = 0;

      @property
      _hpBonus = 0

      @property
      _tempHpBonus = 0

      @property
      damage = 0;

      @property
      baseDamage = 0;

      @property
      tempBaseDamage = 0;


      currentDamage = 0

      @property
      nonAttackRollBonus = 0;

      @property
      tempNonAttackRollBonus = 0;

      @property
      attackRollBonus = 0;

      @property
      tempAttackRollBonus = 0;

      @property
      firstAttackRollBonus = 0;

      @property
      nextAttackRollBonus = 0

      @property
      tempNextAttackRollBonus = 0

      @property
      tempFirstAttackRollBonus = 0;

      @property
      reactCardNode: Node[] = [];

      @property
      reactionData = null;

      @property
      _reactionToggle: ReactionToggle | null = null;

      @property
      cards: Node[] = [];

      @property
      _lootCardsPlayedThisTurn: Node[] = []

      @property
      cardActivated = false;

      @property
      activatedCard: Node | null = null;

      @property
      timeToRespondTimeOut = null;

      @property
      _hasPriority = false;

      @property
      _askingPlayerId = 0;

      set hasPlayerSelectedYesNo(bool: boolean) {
            whevent.emit(GAME_EVENTS.PLAYER_SELECTED_YES_NO, bool)
      }

      @property
      _curses: Node[] = [];

      @property
      hpLable: Label | null = null;

      @property
      _dmgPrevention: number[] = [];

      @property
      _isFirstAttackRollOfTurn = true;

      @property
      _isFirstRollOfTurn = true

      @property
      _isFirstTimeGettingMoney = true;

      @property
      _thisTurnKiller: Node | null = null;

      @property
      setDiceAdmin = 0;

      @property
      _isDead = false;

      @property
      _endTurnFlag = false;

      @property
      lastRoll = 0

      @property
      lastAttackRoll = 0

      @property
      storeCardCostReduction = 0


      skipTurn = false;


      isFirstHitInTurn = true

      @property
      private _numOfItemsToRecharge = -1;

      getNumOfItemsToRecharge() {
            return this._numOfItemsToRecharge
      }

      changeNumOfItemsToRecharge(diff: number, sendToServer: boolean) {
            this._numOfItemsToRecharge += diff
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.PLAYER_CHANGE_NUM_OF_ITEMS_TO_RECHARGE, { playerId: this.playerId, diff })
            }
      }

      setNumOfItemsToRecharge(quantity: number, sendToServer: boolean) {
            const diff = quantity - this._numOfItemsToRecharge
            this.changeNumOfItemsToRecharge(diff, sendToServer)
      }

      otherPlayersCantRespondOnTurn = false

      hasBlankCardEffectActive = false



      /// Admin Methods Only!


      getStoreCost() {
            return WrapperProvider.storeWrapper.out.storeCardsCost - this.storeCardCostReduction
      }

      chooseYesNo(choice: string) {
            //this._playerYesNoDecision = isYes
            console.log(choice)
            let bool: boolean
            choice == "False" ? bool = false : bool = true
            console.log(bool)
            whevent.emit(GAME_EVENTS.PLAYER_SELECTED_YES_NO, bool)

      }

      monsterCardHolderId = 0;

      getMonsterCardHolderId(): number {
            if (this.monsterCardHolderId == 1) {
                  this.monsterCardHolderId = 0;
                  return 1;
            } else {
                  this.monsterCardHolderId++;
                  return 0;
            }
      }

      async giveCard(card: Node) {
            card.parent = WrapperProvider.cardManagerWrapper.out.onTableCardsHolder
            await WrapperProvider.cardManagerWrapper.out.moveCardTo(card, this.hand!.node, true, true)
            switch (card.getComponent(Card)!.type) {
                  case CARD_TYPE.LOOT:
                        WrapperProvider.cardManagerWrapper.out.lootDeck!.getComponent(Deck)!.drawSpecificCard(card, true)
                        await this.gainLoot(card, true)
                        break;
                  case CARD_TYPE.TREASURE:
                        WrapperProvider.cardManagerWrapper.out.treasureDeck!.getComponent(Deck)!.drawSpecificCard(card, true)
                        await this.addItem(card, true, true)
                        break
                  case CARD_TYPE.MONSTER:
                        WrapperProvider.cardManagerWrapper.out.monsterDeck!.getComponent(Deck)!.drawSpecificCard(card, true)
                        const holder = WrapperProvider.monsterFieldWrapper.out.getMonsterCardHoldersIds()[this.getMonsterCardHolderId()];
                        await WrapperProvider.monsterFieldWrapper.out.addMonsterToExsistingPlace(holder, card, true)
                        break;
                  default:
                        break;
            }
      }

      async drawCards(deck: Node, sendToServer: boolean, alreadyDrawnCards?: Node[], numOfCards = 1) {
            let drawnCards: Node[] = []
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_DRAW_FROM_LOOT, [deck, alreadyDrawnCards, numOfCards], null, this.node)
            if (sendToServer) {
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  if (!afterPassiveMeta.args) { debugger; throw new Error("No After Args"); }
                  deck = afterPassiveMeta.args[0]
                  alreadyDrawnCards = afterPassiveMeta.args[1];
                  numOfCards = afterPassiveMeta.args[2]
            }
            if (alreadyDrawnCards && alreadyDrawnCards.length > 0) {
                  drawnCards = alreadyDrawnCards
            } else {
                  for (let index = 0; index < numOfCards; index++) {
                        drawnCards.push(deck.getComponent(Deck)!.drawCard(sendToServer))
                  }
            }
            for (const drawnCard of drawnCards) {
                  await this.doCardDraw(drawnCard, sendToServer)
            }
            await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
      }

      private async doCardDraw(card: Node, sendToServer: boolean) {
            card.setPosition(WrapperProvider.cardManagerWrapper.out.lootDeck!.getPosition());
            card.parent = WrapperProvider.cardManagerWrapper.out.onTableCardsHolder
            if (sendToServer) {
                  await WrapperProvider.cardManagerWrapper.out.moveCardTo(card, this.hand!.node, sendToServer, false, -1, WrapperProvider.cardManagerWrapper.out.lootDeck!.getPosition())
                  const serverData = {
                        signal: Signal.CARD_DRAWN,
                        srvData: { playerId: this.playerId, deckType: CARD_TYPE.LOOT, cardId: card.getComponent(Card)!._cardId },
                  };
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
                  if (card.getComponent(Card)!._isShowingBack) {
                        card.getComponent(Card)!.flipCard(sendToServer)
                  }
                  await this.gainLoot(card, true)
            }
      }


      ///Depraced
      // async drawCard(deck: Node, sendToServer: boolean, alreadyDrawnCard?: Node) {

      //       let drawnCard: Node
      //       if (alreadyDrawnCard != null) {

      //             drawnCard = alreadyDrawnCard
      //       } else {

      //             /////TOOD: Add Abillity to draw From Discard Insted1!
      //             // const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_DRAW_FROM_LOOT, [deck], null, this.node)
      //             // if (sendToServer) {
      //             //       const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
      //             //       if (!afterPassiveMeta.args) { debugger; throw new Error("No After Args"); }
      //             //       itemToAdd = afterPassiveMeta.args[0]
      //             //       itemCardComp = itemToAdd.getComponent(Card)!;
      //             // }

      //             drawnCard = deck.getComponent(Deck)!.drawCard(sendToServer);
      //       }
      //       drawnCard.setPosition(WrapperProvider.cardManagerWrapper.out.lootDeck!.getPosition());
      //       drawnCard.parent = WrapperProvider.cardManagerWrapper.out.onTableCardsHolder
      //       if (sendToServer) {
      //             await WrapperProvider.cardManagerWrapper.out.moveCardTo(drawnCard, this.hand!.node, sendToServer, false, -1, WrapperProvider.cardManagerWrapper.out.lootDeck!.getPosition())
      //             const serverData = {
      //                   signal: Signal.CARD_DRAWN,
      //                   srvData: { playerId: this.playerId, deckType: CARD_TYPE.LOOT, drawnCardId: drawnCard.getComponent(Card)!._cardId },
      //             };
      //             WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
      //             if (drawnCard.getComponent(Card)!._isFlipped) {
      //                   drawnCard.getComponent(Card)!.flipCard(sendToServer)
      //             }
      //             await this.gainLoot(drawnCard, true)
      //       }

      //       // ActionManager
      // }

      async declareAttack(
            monsterCard: Node,
            sendToServer: boolean,
      ) {
            if (sendToServer) {
                  //await decisionMarker._dm.showDecision(this.character, monsterCard, true)
                  const declareAttack = new DeclareAttack(this.character!.getComponent(Card)!._cardId, this, monsterCard)
                  await WrapperProvider.stackWrapper.out.addToStack(declareAttack, true)
            }
      }

      async giveYesNoChoice(flavorText: string) {
            console.log(`give yes no choice`)
            if (!WrapperProvider.cardPreviewManagerWrapper.out.isOpen && !WrapperProvider.stackEffectVisManagerWrapper.out.isOpen) {
                  WrapperProvider.buttonManagerWrapper.out.moveButton(WrapperProvider.buttonManagerWrapper.out.NoButton!, WrapperProvider.buttonManagerWrapper.out.playerButtonLayout!)
                  WrapperProvider.buttonManagerWrapper.out.moveButton(WrapperProvider.buttonManagerWrapper.out.yesButton!, WrapperProvider.buttonManagerWrapper.out.playerButtonLayout!)
            } else {
                  WrapperProvider.buttonManagerWrapper.out.moveButton(WrapperProvider.buttonManagerWrapper.out.NoButton!, WrapperProvider.buttonManagerWrapper.out.cardPreviewButtonLayout!)
                  WrapperProvider.buttonManagerWrapper.out.moveButton(WrapperProvider.buttonManagerWrapper.out.yesButton!, WrapperProvider.buttonManagerWrapper.out.cardPreviewButtonLayout!)
            }
            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.clearPreviewsButton!, BUTTON_STATE.DISABLED)
            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.NoButton!, BUTTON_STATE.ENABLED)
            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.yesButton!, BUTTON_STATE.ENABLED)
            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.NoButton!, BUTTON_STATE.PLAYER_CHOOSE_NO, [this])
            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.yesButton!, BUTTON_STATE.PLAYER_CHOOSE_YES, [this])
            WrapperProvider.cardPreviewManagerWrapper.out.setFalvorText(flavorText)
            const choice = await this.waitForPlayerYesNoSelection()
            WrapperProvider.cardPreviewManagerWrapper.out.setFalvorText("")
            //  WrapperProvider.buttonManagerWrapper.out.enableButton(buttonManagerWrapper._bm.NoButton, BUTTON_STATE.CHANGE_TEXT, ["SKIP"])
            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.clearPreviewsButton!, BUTTON_STATE.ENABLED)
            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.NoButton!, BUTTON_STATE.DISABLED)
            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.yesButton!, BUTTON_STATE.DISABLED)
            WrapperProvider.buttonManagerWrapper.out.moveButton(WrapperProvider.buttonManagerWrapper.out.NoButton!, WrapperProvider.buttonManagerWrapper.out.cardPreviewButtonLayout!)
            WrapperProvider.buttonManagerWrapper.out.moveButton(WrapperProvider.buttonManagerWrapper.out.yesButton!, WrapperProvider.buttonManagerWrapper.out.cardPreviewButtonLayout!)
            if (!choice) {
                  await WrapperProvider.cardPreviewManagerWrapper.out.clearAllPreviews()
                  WrapperProvider.cardPreviewManagerWrapper.out.hidePreviewManager()
                  WrapperProvider.stackEffectVisManagerWrapper.out.hidePreviews()
            }
            return choice;
      }

      async giveNextClick(flavorText: string) {

            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.clearPreviewsButton!, BUTTON_STATE.DISABLED)
            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.nextButton!, BUTTON_STATE.ENABLED)
            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.nextButton!, BUTTON_STATE.PLAYER_CLICKS_NEXT, [this])
            WrapperProvider.cardPreviewManagerWrapper.out.setFalvorText(flavorText)
            await this.waitForNextClick()
            WrapperProvider.cardPreviewManagerWrapper.out.setFalvorText("")
            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.nextButton!, BUTTON_STATE.DISABLED)
            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.clearPreviewsButton!, BUTTON_STATE.ENABLED)

      }

      clickNext() {
            whevent.emit(GAME_EVENTS.PLAYER_CLICKED_NEXT)
      }

      async waitForNextClick() {

            return new Promise((resolve) => {
                  whevent.onOnce(GAME_EVENTS.PLAYER_CLICKED_NEXT, () => {
                        resolve(true);
                  })
            });
      }

      async waitForPlayerYesNoSelection(): Promise<boolean> {

            return new Promise((resolve) => {
                  whevent.onOnce(GAME_EVENTS.PLAYER_SELECTED_YES_NO, (data: boolean) => {
                        console.log(`wait for player yes no selection ${data}`)
                        resolve(Boolean(data));
                  });

            })
      }

      calculateDamage() {
            let damage = 0;
            damage += this.baseDamage;
            damage += this.tempBaseDamage;
            if (this.character) {
                  damage += this.character.getComponent(Character)!.damage;
            }
            // items that increase damage should increase baseDamage
            return damage;
      }

      calculateFinalRoll(rolledNumber: number, rollType: ROLL_TYPE) {
            let endRollNumber = 0;
            switch (rollType) {
                  case ROLL_TYPE.ATTACK:
                        endRollNumber += rolledNumber + this.attackRollBonus + this.tempAttackRollBonus + this.nextAttackRollBonus + this.tempNextAttackRollBonus
                        this.nextAttackRollBonus = 0
                        this.tempNextAttackRollBonus = 0
                        break;
                  case ROLL_TYPE.FIRST_ATTACK:
                        endRollNumber += rolledNumber + this.attackRollBonus + this.tempAttackRollBonus + this.firstAttackRollBonus + this.tempFirstAttackRollBonus + this.nextAttackRollBonus + this.tempNextAttackRollBonus;
                        this.nextAttackRollBonus = 0
                        this.tempNextAttackRollBonus = 0
                        break;
                  default:
                  case ROLL_TYPE.EFFECT:
                  case ROLL_TYPE.EFFECT_ROLL:
                        endRollNumber += rolledNumber + this.nonAttackRollBonus + this.tempNonAttackRollBonus
                        break;
            }
            if (endRollNumber > 6) { endRollNumber = 6 }
            if (endRollNumber < 1) { endRollNumber = 1 }

            return endRollNumber;
      }

      handleDiceRollProperties(isAttack: boolean, rollValue: number) {
            this.lastRoll = rollValue
            this._isFirstRollOfTurn = this._isFirstRollOfTurn ? false : this._isFirstRollOfTurn
            if (isAttack) {
                  this.lastAttackRoll = rollValue
                  if (this._isFirstAttackRollOfTurn) { this._isFirstAttackRollOfTurn = false; }
            }
      }


      async rollDice(rollType: ROLL_TYPE, doNotCheckPassive?: boolean) {
            const playerDice = this.dice!;
            let numberRolled: number | null = null
            if (!(doNotCheckPassive !== undefined && doNotCheckPassive === false)) {
                  const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.DICE_ABOUT_TO_BE_ROLLED, [numberRolled, this, rollType], null, this.node)
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta);
                  if (afterPassiveMeta.args && afterPassiveMeta.args[0]) {
                        numberRolled = afterPassiveMeta.args[0]
                  }
            }
            if (numberRolled == null || numberRolled == undefined) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.ROLL_DICE, { playerId: this.playerId });
                  numberRolled = await playerDice.rollDice(rollType);
                  WrapperProvider.serverClientWrapper.out.send(Signal.ROLL_DICE_ENDED, {
                        playerId: this.playerId,
                        numberRolled: numberRolled,
                  });

            }
            return numberRolled
      }

      async rollAttackDice(sendToServer: boolean) {
            //   this.dice!.getComponentInChildren(RollDice)!.rollType = ROLL_TYPE.ATTACK;
            if (sendToServer) {
                  const attackRoll = new AttackRoll(this.character!.getComponent(Card)!._cardId, this.node, WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity!.node)
                  await WrapperProvider.stackWrapper.out.addToStack(attackRoll, true)
            }

      }

      async handleResetOneTurnProperties() {
            this._tempHpBonus = 0
            this.tempAttackRollBonus = 0
            this.tempNonAttackRollBonus = 0
            this.tempFirstAttackRollBonus = 0
            this.tempNextAttackRollBonus = 0
            this.tempBaseDamage = 0
            this.lastAttackRoll = 0
            this.lastRoll = 0
            this._lootCardsPlayedThisTurn = [];
            this.itemsLostThisTurn = []
            this._thisTurnKiller = null
            this._isFirstTimeGettingMoney = true;
            this._isFirstAttackRollOfTurn = true
            this._isFirstRollOfTurn = true;
            this._isDead = false;
            this.isFirstHitInTurn = true
            this._mustAttackPlays = 0;
            this._mustAttackMonsters = []
            this._mustDeckAttackPlays = 0
            this._attackDeckPlays = 0
            this.hasBlankCardEffectActive = false
            await this.heal(this.character!.getComponent(Character)!.hp + this._hpBonus, false, true)
      }

      async loseLoot(loot: Node, sendToServer: boolean) {

            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_LOSE_LOOT, [loot], null, this.node)
            if (sendToServer) {
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  if (!afterPassiveMeta.args) { debugger; throw new Error("No After Args"); }
                  loot = afterPassiveMeta.args[0]
            }
            this.hand!.removeCardFromLayout(loot)
            this.removeFromHandCards([loot])
            const serverData = {
                  signal: Signal.PLAYER_LOSE_LOOT,
                  srvData: { playerId: this.playerId, cardId: loot.getComponent(Card)!._cardId },
            };
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
                  await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
            }
      }

      async gainLoot(loot: Node, sendToServer: boolean) {
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_GAIN_LOOT, [loot], null, this.node)
            if (sendToServer) {
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  if (!afterPassiveMeta.args) { debugger; throw new Error("No After Args"); }
                  loot = afterPassiveMeta.args[0]
            }
            this.hand!.addCardToLayout(loot)
            if (sendToServer) {
                  loot.getComponent(Card)!.setOwner(this, sendToServer)
            }
            // loot.getComponent(Card)!._ownedBy = this;
            this.addHandCards([loot])
            const mePlayerId = WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId;
            if (loot.getComponent(Card)!._isShowingBack) {
                  if (this.playerId == mePlayerId) {
                        loot.getComponent(Card)!.flipCard(sendToServer)
                  }
            } else {
                  if (this.playerId != mePlayerId) {
                        loot.getComponent(Card)!.flipCard(sendToServer)
                  }
            }
            const serverData = {
                  signal: Signal.PLAYER_GET_LOOT,
                  srvData: { playerId: this.playerId, cardId: loot.getComponent(Card)!._cardId },
            };
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
                  await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
            }
      }

      async discardLoot(lootCard: Node, sendToServer: boolean) {
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_DISCARD_LOOT, [lootCard], null, this.node)
            if (sendToServer) {
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  if (!afterPassiveMeta.args) { debugger; throw new Error("No After Args"); }
                  lootCard = afterPassiveMeta.args[0]

                  lootCard.getComponent(Card)!.setOwner(null, sendToServer);
            }
            if (sendToServer) {
                  await this.loseLoot(lootCard, sendToServer)
            }
            const playerId = this.playerId;
            // let discardAction = new MoveLootToPile(
            //   { lootCard: lootCard },
            //   this.playerId
            // );
            if (sendToServer) {
                  //  await WrapperProvider.cardManagerWrapper.out.moveCardTo(lootCard, WrapperProvider.pileManagerWrapper.out.lootCardPileNode, sendToServer)
                  await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.LOOT, lootCard, sendToServer)
            }
            const cardId = lootCard.getComponent(Card)!._cardId;
            const serverData = {
                  signal: Signal.DISCARD_LOOT,
                  srvData: { playerId: playerId, cardId: cardId },
            };
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
                  await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
            }
            // let bool = await WrapperProvider.actionManagerWrapper.out.showSingleAction(
            //   discardAction,
            //   serverData,
            //   sendToServer
            // );
      }

      async buyItem(itemToBuy: Node, sendToServer: boolean) {

            if (sendToServer) {
                  //await decisionMarker._dm.showDecision(this.character, itemToBuy, true)
                  const purchaseItem = new PurchaseItem(this.character!.getComponent(Card)!._cardId, itemToBuy, this.playerId)

                  await WrapperProvider.stackWrapper.out.addToStack(purchaseItem, sendToServer)
            }
      }

      async addItem(itemToAdd: Node, sendToServer: boolean, isReward: boolean) {
            let itemCardComp: Card = itemToAdd.getComponent(Card)!;
            const treasureDeck = WrapperProvider.cardManagerWrapper.out.treasureDeck;
            if (itemToAdd == treasureDeck) {
                  itemToAdd = treasureDeck.getComponent(Deck)!.drawCard(sendToServer);
                  itemCardComp = itemToAdd.getComponent(Card)!;
            }
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ADD_ITEM, [itemToAdd], null, this.node)
            if (sendToServer) {
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  if (!afterPassiveMeta.args) { debugger; throw new Error("No After Args"); }
                  itemToAdd = afterPassiveMeta.args[0]
                  itemCardComp = itemToAdd.getComponent(Card)!;
            }

            const playerId = this.playerId;
            const cardId = itemCardComp._cardId;
            const cardItemComp = itemToAdd.getComponent(Item)!;

            await this.addItemByType(cardItemComp.node, sendToServer)
            this.cards.push(itemToAdd);
            itemToAdd.getComponent(Item)!.setLastOwner(this, false)
            const serverData = {
                  signal: Signal.ADD_AN_ITEM,
                  srvData: { playerId, cardId, isReward },
            };
            if (sendToServer) {
                  itemCardComp.setOwner(this, sendToServer)
                  await WrapperProvider.cardManagerWrapper.out.moveCardTo(itemCardComp.node, this.desk!.node, sendToServer, true)
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
                  WrapperProvider.cardManagerWrapper.out.makeItemActivateable(itemToAdd)
            }
            await this.desk!.addToDesk(itemToAdd.getComponent(Card)!)
            WrapperProvider.cardManagerWrapper.out.makeCardPreviewable(itemToAdd)
            passiveMeta.result = true

            // do passive effects after!
            if (sendToServer) {
                  console.log(`test for passive after adding`)
                  passiveMeta.result = await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
            }
            return passiveMeta.result

      }

      async playLootCard(lootCard: Node, sendToServer: boolean) {
            //    let action = new MoveLootToPile({ lootCard: lootCard }, playerId);
            if (sendToServer) {
                  let hasLockingEffect: boolean;
                  const collector = lootCard.getComponent(CardEffect)!.getMultiEffectCollector();
                  if (collector != null && !(collector instanceof MultiEffectChoose)) {
                        hasLockingEffect = true;
                  } else { hasLockingEffect = false; }
                  if (this == WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer() && this.lootCardPlays > 0) {
                        this.lootCardPlays -= 1
                  }
                  // await decisionMarker._dm.showDecision(lootCard, lootCard, true, true)
                  lootCard.getComponent(Card)!.isGoingToBePlayed = true
                  const playLoot = new PlayLootCardStackEffect(this.character!.getComponent(Card)!._cardId, hasLockingEffect, lootCard, this.character!, false, false)
                  await WrapperProvider.stackWrapper.out.addToStack(playLoot, sendToServer)

            } else {
                  if (lootCard.getComponent(Card)!._isShowingBack) {
                        lootCard.getComponent(Card)!.flipCard(sendToServer);
                  }
            }
      }

      /**
       * !!!!!!!!!! Don't put await infront of this function!!!!!!!!!!!!!
       * @param killerCard who killed the monster
       */
      async killPlayer(sendToServer: boolean, killerCard: Node) {
            if (this._isDead) {
                  WrapperProvider.loggerWrapper.out.error(`player ${this.playerId} is dead and can't be killed again`)
                  return
            }
            if (sendToServer) {
                  console.error(`add player death to stack`)
                  const playerDeath = new PlayerDeath(this.character!.getComponent(Card)!._cardId, this.character!, killerCard)
                  await WrapperProvider.stackWrapper.out.addToStackAbove(playerDeath)
                  // if (addBelow) {
                  //  await WrapperProvider.stackWrapper.out.addToStackBelow(playerDeath, stackEffectToAddBelowTo, false)

            }
      }

      addCurse(curseCard: Node, sendToServer: boolean) {
            this._curses.push(curseCard)
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.PLAYER_ADD_CURSE, { playerId: this.playerId, cardId: curseCard.getComponent(Card)!._cardId })
            }
      }

      async removeCurse(curseCard: Node, sendToServer: boolean) {
            if (sendToServer) {
                  await curseCard.getComponent(Item)?.destroyItem(sendToServer)

            }
      }

      async payPenalties() {

            // lose 1 coin
            let moneyLost = 0
            if (this.coins > 0) {
                  await this.changeMoney(-1, true)
                  moneyLost = -1
            }
            // lose 1 loot if you have any
            let chosenLoot: Node | null = null
            if (this.handCards.size > 0) {
                  const chooseCard = new ChooseCard();
                  chooseCard.playerId = this.playerId
                  chooseCard.flavorText = "Choose A Loot To Discard"

                  const cardToChooseFrom = chooseCard.getCardsToChoose(
                        CHOOSE_CARD_TYPE.MY_HAND,
                        this,
                  );
                  if (cardToChooseFrom.length == 1) {
                        chosenLoot = cardToChooseFrom[0]
                  } else {
                        const chosenData = await chooseCard.requireChoosingACard(cardToChooseFrom)
                        chosenLoot = WrapperProvider.cardManagerWrapper.out.getCardById(chosenData.cardChosenId);
                  }
                  await this.loseLoot(chosenLoot, true)
                  await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.LOOT, chosenLoot, true)
            }

            const nonEternalItems = this.getDeskCards().filter(
                  card => (!card.getComponent(Item)!.eternal)
            );

            // lose 1 non-eternal item if you have any
            if (nonEternalItems.length > 0) {
                  const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_CHOOSE_ITEM_TO_DESTROY_FOR_PANELTIES, [this], null, this.node)
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  let chosenItem = afterPassiveMeta.args ? afterPassiveMeta.args[1] : null
                  if (!chosenItem) {

                        const chooseCard = new ChooseCard();
                        chooseCard.flavorText = "Choose An Item To Destroy"

                        const cardToChooseFrom = chooseCard.getCardsToChoose(
                              CHOOSE_CARD_TYPE.MY_NON_ETERNALS,
                              this,
                        );
                        if (cardToChooseFrom.length == 1) {
                              chosenItem = cardToChooseFrom[0]
                        } else {
                              const chosenData = await chooseCard.requireChoosingACard(cardToChooseFrom);
                              chosenItem = WrapperProvider.cardManagerWrapper.out.getCardById(chosenData.cardChosenId);
                        }
                  }
                  await this.loseItem(chosenItem, true)
                  await WrapperProvider.pileManagerWrapper.out.addCardToPile(chosenItem.getComponent(Card)!.type, chosenItem, true)
                  passiveMeta.args!.push(chosenItem)
                  await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
            }

            this.getActiveItems().forEach(item => item.getComponent(Item)!.useItem(true))
            return { chosenLoot, moneyLost }
      }
      itemsLostThisTurn: Node[] = []

      async loseItem(itemToLose: Node, sendToServer: boolean) {
            let passiveMeta: PassiveMeta
            if (sendToServer) {
                  passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_LOSE_ITEM, [itemToLose], null, this.node)
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  passiveMeta.args = afterPassiveMeta.args;
                  if (!afterPassiveMeta.args) { debugger; throw new Error("No After Args"); }
                  itemToLose = afterPassiveMeta.args[0]
            }
            this.itemsLostThisTurn.push(itemToLose)

            this.deskCards.clear()
            const newDeskCards = this.getDeskCards().filter(item => item != itemToLose).map(card => card.getComponent(Card)!._cardId)
            newDeskCards.forEach(card => {
                  this.deskCards.add(card)
            });
            this.removeFromActiveItems([itemToLose])
            this.removeFromPassiveItems([itemToLose])
            this.removeFromPaidItems([itemToLose])
            if (sendToServer) {
                  WrapperProvider.passiveManagerWrapper.out.removePassiveItemEffects(itemToLose, true)
            }

            if (sendToServer) {
                  await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta!)
                  itemToLose.getComponent(Card)!.setOwner(null, sendToServer)
            }
      }

      calcNumOfItemsToCharge() {
            return (this._numOfItemsToRecharge == -1) ? this.activeItems.size : this._numOfItemsToRecharge
      }


      private rechargeCharacterAtStartOfTurn = true

      setRechargeCharacterAtStartOfTurn(bool: boolean, sendToServer: boolean) {
            this.rechargeCharacterAtStartOfTurn = bool
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.PLAYER_SET_RECHARGE_CHAR_AT_START_OF_TURN, { playerId: this.playerId, bool })
            }
      }

      async startTurn(numOfCardToDraw: number, numberOfItemsToCharge: number, sendToServer: boolean) {

            if (WrapperProvider.stackWrapper.out._currentStack.length > 0) {
                  console.log(`wait for stack to be emptied`)
                  console.log(WrapperProvider.stackWrapper.out._currentStack)
                  await WrapperProvider.stackWrapper.out.waitForStackEmptied()
            }

            if (sendToServer) {

                  if (this.skipTurn) {
                        this.skipTurn = false;
                        await this.endTurn(true)
                        return
                  }

                  const activeItems = this.getActiveItems().filter(c => {
                        if (!this.rechargeCharacterAtStartOfTurn) {
                              if (c.getComponent(Character)) {
                                    return false
                              }
                              return true
                        }
                        return true
                  });
                  // recharge items
                  if (numberOfItemsToCharge >= activeItems.length) {
                        for (const item of activeItems) {
                              if (item.getComponent(Item)!.needsRecharge) {
                                    await this.rechargeItem(item, sendToServer)
                              }
                        }
                  } else {
                        const chooseCard = new ChooseCard();
                        chooseCard.flavorText = "Choose Item To Recharge"
                        for (let i = 0; i < numberOfItemsToCharge; i++) {
                              const cardChosenData = await chooseCard.requireChoosingACard(activeItems)
                              const item = WrapperProvider.cardManagerWrapper.out.getCardById(cardChosenData.cardChosenId, true).getComponent(Item)!
                              if (item.needsRecharge) {
                                    await this.rechargeItem(item.node, sendToServer)
                              }
                        }
                  }

                  //recharge character card
                  if (this.rechargeCharacterAtStartOfTurn) {
                        await this.rechargeItem(this.character!, sendToServer)
                  }

                  // add passive check for "Start of turn" Effects.

                  await this.givePriority(true)
                  const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_START_TURN, [numOfCardToDraw], null, this.node)
                  if (sendToServer) {
                        const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                        passiveMeta.args = afterPassiveMeta.args;
                        if (!afterPassiveMeta.args) { debugger; throw new Error("No After Args"); }
                        numOfCardToDraw = afterPassiveMeta.args[0]
                  }

                  // put loot 1 on the stack for the player

                  for (let i = 0; i < numOfCardToDraw; i++) {
                        const turnDraw = new StartTurnLoot(this.character!.getComponent(Card)!._cardId, this.character!)

                        await WrapperProvider.stackWrapper.out.addToStack(turnDraw, true)
                        // await this.drawCard(WrapperProvider.cardManagerWrapper.out.lootDeck, sendToServer)
                  }
                  WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.nextTurnButton!, BUTTON_STATE.ENABLED)
            }

      }

      /**
       * @async dont put await before this function, this will run only when the stack was emptied.
       * @param sendToServer
       */

      isEndTurnRunning = false;

      async endTurn(sendToServer: boolean) {

            if (this.isEndTurnRunning) { return }
            this.isEndTurnRunning = true
            // if (WrapperProvider.stackWrapper.out._currentStack.length > 0) {
            //   await WrapperProvider.stackWrapper.out.waitForStackEmptied()
            // }
            this._endTurnFlag = false

            // end of turn passive effects should trigger
            if (sendToServer) {
                  console.log(`end turn`)

                  const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_END_TURN, [], null, this.node)
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  passiveMeta.args = afterPassiveMeta.args;
                  await this.givePriority(true)
                  // effect that last to end of turn wear off.
                  WrapperProvider.passiveManagerWrapper.out.oneTurnAfterEffects = [];
                  WrapperProvider.passiveManagerWrapper.out.oneTurnBeforeEffects = [];
                  WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.nextTurnButton!, BUTTON_STATE.DISABLED)
            }
            console.log(WrapperProvider.stackWrapper.out._currentStack)
            await WrapperProvider.turnsManagerWrapper.out.nextTurn();
            this.isEndTurnRunning = false
            /// add a check if you have more than 10 cards discard to 10.
            return true
      }

      async addDamagePrevention(dmgToPrevent: number, sendToServer: boolean) {
            this._dmgPrevention.push(dmgToPrevent)
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.PLAYER_ADD_DMG_PREVENTION, { playerId: this.playerId, dmgToPrevent: dmgToPrevent })
            }
      }

      async preventDamage(incomingDamage: number) {
            if (this._dmgPrevention.length > 0) {
                  // console.log(`doing dmg prevention`)
                  const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_PREVENT_DAMAGE, null, null, this.node)
                  this._dmgPrevention.sort((a, b) => a - b)
                  let newDamage = incomingDamage

                  while (this._dmgPrevention.length > 0) {
                        if (newDamage == 0) {
                              return 0;
                        } else {
                              if (this._dmgPrevention.indexOf(newDamage) >= 0) {
                                    const dmgPreventionInstance = this._dmgPrevention.splice(this._dmgPrevention.indexOf(newDamage), 1)
                                    //   console.error(`prevented exactly ${dmgPreventionInstance[0]} dmg`)
                                    newDamage -= dmgPreventionInstance[0]

                                    continue;
                              } else {
                                    const instance = this._dmgPrevention.shift()!
                                    newDamage -= instance
                                    continue;
                              }
                        }
                  }

                  passiveMeta.result = newDamage
                  const thisResult = await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
                  WrapperProvider.announcementLableWrapper.out.showAnnouncement(`${this.name} Prevented ${incomingDamage - thisResult} Damage`, ANNOUNCEMENT_TIME, true)
                  if (thisResult <= 0) {
                        return 0
                  } else { return thisResult }
            } else { return incomingDamage }
      }

      heal(hpToHeal: number, sendToServer: boolean, healDown?: boolean) {
            this._lastHp = this._Hp;
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.PLAYER_HEAL, { playerId: this.playerId, hpToHeal: hpToHeal, healDown: healDown })
            }
            if (healDown) {
                  this._Hp = hpToHeal
            } else {
                  if (this._Hp + hpToHeal > this.character!.getComponent(Character)!.hp + this._hpBonus + this._tempHpBonus) {
                        this._Hp = this.character!.getComponent(Character)!.hp + this._hpBonus + this._tempHpBonus
                  } else {
                        this._Hp += hpToHeal
                  }
            }
      }

      @property
      _killer: Node | null = null

      /**
       *
       * @param damage
       * @param sendToServer
       * @param damageDealer the card who deals the damage (character or monster)
       */
      async takeDamage(damage: number, sendToServer: boolean, damageDealer: Node) {

            this._lastHp = this._Hp;

            if (!sendToServer) {
                  if (this._Hp - damage < 0) {
                        this._Hp = 0
                  } else {
                        this._Hp -= damage;
                  }
                  return true
                  // this.hpLable.string = `${this._Hp}♥`
            } else {
                  // Prevent Damage
                  damage = await this.preventDamage(damage)
                  if (damage == 0) {
                        console.log(`damage after reduction is 0`)
                        return false
                  }
                  /////

                  let toContinue = true
                  const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_GET_HIT, [damage, damageDealer, this.isFirstHitInTurn], null, this.node)
                  if (sendToServer) {
                        const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                        passiveMeta.args = afterPassiveMeta.args;
                        if (!afterPassiveMeta.args) { debugger; throw new Error("No After Args"); }
                        damage = afterPassiveMeta.args[0]
                        toContinue = afterPassiveMeta.continue
                  }
                  if (toContinue) {
                        if (this._Hp - damage < 0) {
                              this._Hp = 0
                        } else {
                              this._Hp -= damage
                        }
                        if (damage > 0) {
                              this.isFirstHitInTurn = false;
                              WrapperProvider.particleManagerWrapper.out.runParticleOnce(this.character!, PARTICLE_TYPES.PLAYER_GET_HIT)
                              WrapperProvider.soundManagerWrapper.out.playSound(WrapperProvider.soundManagerWrapper.out.playerGetHit!)
                              // this.hpLable.string = `${this._Hp}♥`
                              const serverData = {
                                    signal: Signal.PLAYER_GET_HIT,
                                    srvData: { playerId: this.playerId, damage: damage, damageDealerId: passiveMeta.args![1].getComponent(Card)!._cardId },
                              };
                              if (sendToServer) {
                                    WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
                                    if (this._Hp == 0 && this._lastHp != 0) {
                                          this._killer = damageDealer
                                          await this.killPlayer(true, damageDealer)
                                    }
                              }
                        }

                  }
                  // let isDead = await this.checkIfDead();

                  //  passiveMeta.result = isDead;
                  if (sendToServer) {
                        // return the original or changed result!;
                        if (damage > 0) {
                              return true
                        } else {
                              return false;
                        }
                  }
            }
            return true
      }

      async gainHeartContainer(hpToGain: number, isTillEndOfTurn: boolean, sendToServer: boolean) {

            this._lastHp = this._Hp;
            if (isTillEndOfTurn) {
                  this._tempHpBonus += hpToGain;
            } else { this._hpBonus += hpToGain; }
            this._Hp = this._Hp + this._hpBonus + this._tempHpBonus;
            // this.hpLable.string = `${this._Hp + this._hpBonus + this._tempHpBonus}♥`
            const serverData = {
                  signal: Signal.PLAYER_GAIN_HP,
                  srvData: { playerId: this.playerId, hpToGain: hpToGain, isTemp: isTillEndOfTurn },
            };
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
            }
            return true;
      }

      async gainDMG(DMGToGain: number, isTillEndOfTurn: boolean, sendToServer: boolean) {
            if (isTillEndOfTurn) {
                  this.tempBaseDamage += DMGToGain
            } else {
                  this.baseDamage += DMGToGain;

            }
            this.calculateDamage()
            const serverData = {
                  signal: Signal.PLAYER_GAIN_DMG,
                  srvData: { playerId: this.playerId, DMGToGain: DMGToGain, isTemp: isTillEndOfTurn },
            };
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
            }
            return true;
      }

      async gainRollBonus(bonusToGain: number, isTillEndOfTurn: boolean, sendToServer: boolean) {
            if (isTillEndOfTurn) {
                  this.tempNonAttackRollBonus += bonusToGain;
            } else { this.nonAttackRollBonus += bonusToGain; }
            const serverData = {
                  signal: Signal.PLAYER_GAIN_ROLL_BONUS,
                  srvData: { playerId: this.playerId, bonusToGain: bonusToGain, isTemp: isTillEndOfTurn },
            };
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
            }
            return true;
      }

      async gainAttackRollBonus(bonusToGain: number, isTillEndOfTurn: boolean, isOnlyNextAttack: boolean, sendToServer: boolean) {
            if (isTillEndOfTurn) {
                  if (isOnlyNextAttack) {
                        this.tempNextAttackRollBonus += bonusToGain
                  } else {
                        this.tempAttackRollBonus += bonusToGain;
                  }
            } else {
                  if (isOnlyNextAttack) {
                        this.nextAttackRollBonus += bonusToGain
                  } else {
                        this.attackRollBonus += bonusToGain;
                  }
            }
            const serverData = {
                  signal: Signal.PLAYER_GAIN_ATTACK_ROLL_BONUS,
                  srvData: { playerId: this.playerId, bonusToGain: bonusToGain, isTemp: isTillEndOfTurn, isOnlyNextAttack },
            };
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
            }
            return true;
      }

      async gainFirstAttackRollBonus(bonusToGain: number, isTillEndOfTurn: boolean, sendToServer: boolean) {
            if (isTillEndOfTurn) {
                  this.tempFirstAttackRollBonus += bonusToGain
            } else { this.firstAttackRollBonus += bonusToGain; }
            const serverData = {
                  signal: Signal.PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS,
                  srvData: { playerId: this.playerId, bonusToGain: bonusToGain, isTemp: isTillEndOfTurn },
            };
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
            }
            return true;
      }

      rechargeItem(itemCard: Node, sendToServer: boolean) {
            const item = itemCard.getComponent(Item)!;
            item.rechargeItem(sendToServer);
      }

      deactivateItem(itemCard: Node, sendToServer: boolean) {
            const item = itemCard.getComponent(Item)!;
            item.useItem(sendToServer)
      }

      async activateCard(card: Node) {
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ACTIVATE_ITEM, [card], null, this.node)
            const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
            if (!afterPassiveMeta.args) { debugger; throw new Error("No After Args"); }
            card = afterPassiveMeta.args[0]

            let hasLockingEffect: boolean;
            const collector = card.getComponent(CardEffect)!.getMultiEffectCollector();
            if (collector != null && !(collector instanceof MultiEffectChoose)) {
                  hasLockingEffect = true;
            } else { hasLockingEffect = false; }
            //await decisionMarker._dm.showDecision(this.character, card, true)
            const activateItem = new ActivateItem(this.character!.getComponent(Card)!._cardId, hasLockingEffect, card, this.character!, false)
            await WrapperProvider.stackWrapper.out.addToStack(activateItem, true)

      }

      async receiveSoulCard(cardWithSoul: Node, sendToServer: boolean) {

            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_GET_SOUL_CARD, [cardWithSoul], null, this.node)
            if (sendToServer) {
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  if (!afterPassiveMeta.args) { debugger; throw new Error("No After Args"); }
                  cardWithSoul = afterPassiveMeta.args[0]
            }

            this.addSoulCards([cardWithSoul])
            this.souls += cardWithSoul.getComponent(Card)!.souls;
            const id = this.playerId;

            const serverData = {
                  signal: Signal.GET_SOUL,
                  srvData: { playerId: id, cardId: cardWithSoul.getComponent(Card)!._cardId },
            };
            if (sendToServer) {
                  console.error(`move card to`)
                  await WrapperProvider.cardManagerWrapper.out.moveCardTo(cardWithSoul, this.soulsLayout!, true, true)
                  console.error(`after move card to`)
                  cardWithSoul.setParent(this.soulsLayout)
                  cardWithSoul.setPosition(0, 0)
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
                  const monster = cardWithSoul.getComponent(Monster);
                  if (this.souls >= SOULS_NEEDED_TO_WIN + this._extraSoulsNeededToWin) {
                        whevent.emit(GAME_EVENTS.GAME_OVER, this.playerId)
                  } else if (monster && monster.monsterPlace != null) {
                        await monster.monsterPlace.removeMonster(cardWithSoul, sendToServer);
                  }
                  passiveMeta.result = await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
            }
      }

      loseSoul(cardWithSoul: Node, sendToServer: boolean) {

            this.souls -= cardWithSoul.getComponent(Card)!.souls;
            this.removeFromSoulCards([cardWithSoul])
            const id = this.playerId;

            const serverData = {
                  signal: Signal.LOSE_SOUL,
                  srvData: { playerId: id, cardId: cardWithSoul.getComponent(Card)!._cardId },
            };
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
                  if (this.souls >= 4) {
                        WrapperProvider.MainScriptNode!.emit("gameOver", this.playerId)
                  }
            }
      }

      givePriority(sendToServer: boolean) {
            this._hasPriority = true;
            for (const player of WrapperProvider.playerManagerWrapper.out.players) {
                  if (player.getComponent(Player)!.playerId != this.playerId) {
                        player.getComponent(Player)!._hasPriority = false;
                  }
            }
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.GIVE_PLAYER_PRIORITY, { playerId: this.playerId })
            }
      }

      // Example for passives, any interaction for passives needs to be like this!
      async changeMoney(numOfCoins: number, sendToServer: boolean, isStartGame?: boolean) {
            // do passive effects b4
            let toContinue = true;
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_CHANGE_MONEY, Array.of(numOfCoins), null, this.node)
            if (sendToServer) {
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  passiveMeta.args = afterPassiveMeta.args;
                  if (!afterPassiveMeta.args) { debugger; throw new Error("No After Args"); }
                  numOfCoins = afterPassiveMeta.args[0];
                  toContinue = afterPassiveMeta.continue;
            }
            // if continue do regular function
            if (toContinue) {
                  // regular function
                  if (this.coins + numOfCoins > 0) {
                        this.coins += numOfCoins;
                  } else {
                        this.coins = 0
                  }
                  if (numOfCoins > 0) {
                        WrapperProvider.soundManagerWrapper.out.playSound(WrapperProvider.soundManagerWrapper.out.coinGetSound!)

                  } else {
                        WrapperProvider.soundManagerWrapper.out.playSound(WrapperProvider.soundManagerWrapper.out.coinLoseSound!)
                  }

                  if (sendToServer) {
                        WrapperProvider.serverClientWrapper.out.send(Signal.SET_MONEY, { playerId: this.playerId, numOfCoins: this.coins })
                  }
            }
            // set the retun value of the original function as the result
            passiveMeta.result = null
            // do passive effects after!
            if (sendToServer) {
                  passiveMeta.result = await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
            }
            // return the original or changed result!;.

            if (numOfCoins > 0 && this._isFirstTimeGettingMoney && !isStartGame) {
                  this._isFirstTimeGettingMoney = false;
            }

            return passiveMeta.result;

      }

      // for passives so dont trigger passiveCheck
      setMoney(numOfCoins: number, sendToServer: boolean) {
            this.coins = numOfCoins;
            if (sendToServer) {

                  WrapperProvider.serverClientWrapper.out.send(Signal.SET_MONEY, { playerId: this.playerId, numOfCoins: numOfCoins })
            }
      }

      setDesk(desk: Node) {
            this.desk = desk.getComponent(PlayerDesk);
            const characterLayout = this.desk!.soulsLayout;
            this.soulsLayout = characterLayout;
            this.desk!._playerId = this.playerId
            this.desk!.name = "Desk " + this.playerId
      }

      setHand(hand: Node) {
            // this.node.addChild(hand);
            const handWidget: Widget = hand.getComponent(Widget)!;
            handWidget.updateAlignment();
            hand.getComponent(CardLayout)!.boundingBoxWithoutChildren = hand.getComponent(UITransform)!.getBoundingBoxToWorld();

            this.hand = hand.getComponent(CardLayout)!;
            this.hand.playerId = this.playerId;
      }

      calculateReactions() {
            this.reactCardNode = [];

            const paidItems = this.getPaidItems();
            const activeItems = this.getActiveItems();
            const reactableItems = [...activeItems, ...paidItems]

            for (let i = 0; i < reactableItems.length; i++) {
                  const reactableItem = reactableItems[i].getComponent(Item)!;
                  const cardEffectComp = reactableItem.node.getComponent(CardEffect)!;
                  try {
                        if (paidItems.indexOf(reactableItem.node) >= 0 && cardEffectComp.testEffectsPreConditions(false)) {
                              this.reactCardNode.push(reactableItem.node);
                        } else if (!reactableItem.needsRecharge && cardEffectComp.testEffectsPreConditions(false)) {
                              this.reactCardNode.push(reactableItem.node);
                        }
                  } catch (error) {
                        WrapperProvider.loggerWrapper.out.error(error)
                  }
            }
            if (
                  //WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer() == this &&
                  this.lootCardPlays > 0) {
                  const handCards = this.getHandCards();
                  for (const handCard of handCards) {
                        this.reactCardNode.push(handCard)
                  }
                  // if(this.reactCardNode.length == 0) this._reactionToggle.uncheck()
            }

      }

      showAvailableReactions() {
            for (let i = 0; i < this.reactCardNode.length; i++) {
                  const card = this.reactCardNode[i];
                  WrapperProvider.animationManagerWrapper.out.showAnimation(card, ANIM_COLORS.BLUE)
            }
            WrapperProvider.serverClientWrapper.out.send(Signal.SHOW_REACTIONS, { playerId: this.playerId, cardsIds: this.reactCardNode.map(card => card.getComponent(Card)!._cardId) })
      }

      hideAvailableReactions() {
            for (let i = 0; i < this.reactCardNode.length; i++) {
                  const card = this.reactCardNode[i];
                  WrapperProvider.animationManagerWrapper.out.endAnimation(card)
            }
            WrapperProvider.serverClientWrapper.out.send(Signal.HIDE_REACTIONS, { playerId: this.playerId, cardsIds: this.reactCardNode.map(card => card.getComponent(Card)!._cardId) })
      }

      skipButtonClicked() {
            this.respondWithNoAction()
      }

      respondWithNoAction() {
            console.error(`respond with no action `)
            const askingPlayerId = this._askingPlayerId
            this.hideAvailableReactions()
            if (this._inGetResponse) {
                  this._inGetResponse = false;
            }
            if (this._responseTimeout != null) {
                  clearTimeout(this._responseTimeout!)

                  this._responseTimeout = null;
            }
            this._reactionToggle!.removeRespondWithNoAction()
            WrapperProvider.announcementLableWrapper.out.hideTimer(true)
            WrapperProvider.announcementLableWrapper.out.hideAnnouncement(false)
            whevent.emit(GAME_EVENTS.PLAYER_CARD_NOT_ACTIVATED)
            WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.skipButton!, BUTTON_STATE.DISABLED)
            // find('Canvas/SkipButton').off(Node.EventType.TOUCH_START)
            if (askingPlayerId != this.playerId) { WrapperProvider.serverClientWrapper.out.send(Signal.RESPOND_TO, { playerId: askingPlayerId, stackEffectResponse: false }) }
            // this._askingPlayerId = -1
      }

      @property
      _inGetResponse = false;

      @property
      _responseTimeout: number | null = null;

      async getResponse(askingPlayerId: number) {
            if (askingPlayerId == -1) {
                  throw new Error(`Get Response asked from id -1, shuold not happen`)
            }
            this._askingPlayerId = askingPlayerId
            this._inGetResponse = true
            WrapperProvider.stackWrapper.out.hasAnyoneResponded = false;
            this.calculateReactions();
            // nothing to respond with or switch is off
            if (this.reactCardNode.length == 0 || !this._reactionToggle!.isChecked || this._isDead) {
                  if (this._askingPlayerId == this.playerId) {
                        if (this._inGetResponse) {
                              this._inGetResponse = false;
                        }
                        if (this._responseTimeout != null) {
                              clearTimeout(this._responseTimeout!)

                              this._responseTimeout = null;
                        }
                        return false
                  } else {
                        this.respondWithNoAction();
                  }
            } else {
                  if (this._reactionToggle!.isChecked) {
                        WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.skipButton!, BUTTON_STATE.ENABLED)
                        this._reactionToggle!.addRespondWithNoAction(this.node)
                        // this._reactionToggle.node.once(Node.EventType.TOUCH_START, () => {
                        //   this.respondWithNoAction(this._askingPlayerId)
                        // })
                  }
                  const blockReactions = this.respondWithNoAction.bind(this)
                  // if time is out send a no reaction taken message
                  WrapperProvider.announcementLableWrapper.out.showTimer(TIME_TO_REACT_ON_ACTION, true)
                  WrapperProvider.announcementLableWrapper.out.showAnnouncement(`Choose A Reaction`, 0, false)
                  this._responseTimeout = setTimeout(blockReactions, TIME_TO_REACT_ON_ACTION * 1000, askingPlayerId);
                  // make skip btn skip and respond to the asking player that you didnt do anything
                  WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.skipButton!, BUTTON_STATE.SKIP_SKIP_RESPONSE, [this._responseTimeout, this, askingPlayerId])
                  for (let i = 0; i < this.reactCardNode.length; i++) {
                        const card = this.reactCardNode[i];
                        WrapperProvider.cardManagerWrapper.out.disableCardActions(card);
                        WrapperProvider.cardManagerWrapper.out.makeCardReactable(card, this.node);
                  }
                  this.showAvailableReactions();
                  const activatedCard = await this.waitForCardActivation();
                  WrapperProvider.announcementLableWrapper.out.hideTimer(true)
                  WrapperProvider.announcementLableWrapper.out.hideAnnouncement(false)
                  WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.skipButton!, BUTTON_STATE.DISABLED)
                  if (!activatedCard) { return false }
                  if (activatedCard != null) {
                        this._reactionToggle!.removeRespondWithNoAction()
                        clearTimeout(this._responseTimeout);
                        if (this._askingPlayerId != this.playerId) {
                              WrapperProvider.serverClientWrapper.out.send(Signal.RESPOND_TO, { playerId: this._askingPlayerId, stackEffectResponse: true })
                        }
                        this._askingPlayerId = -1;
                        this.hideAvailableReactions();

                        if (activatedCard.getComponent(Card)!.type != CARD_TYPE.LOOT) {
                              await this.activateCard(activatedCard);
                        } else {
                              await this.playLootCard(activatedCard, true)
                        }
                  }
                  this.activatedCard = null
                  return true
            }
      }

      async waitForCardActivation(): Promise<Node | null> {
            return new Promise((resolve) => {
                  whevent.onOnce(GAME_EVENTS.PLAYER_CARD_ACTIVATED, (data: Node) => {
                        this.cardActivated = true;
                        resolve(data);
                  })
                  whevent.onOnce(GAME_EVENTS.PLAYER_CARD_NOT_ACTIVATED, () => {
                        resolve(null);
                  })
            });
      }

      setDice(dice: Node) {
            // this.node.addChild(dice);
            this.dice = dice.getComponent(Dice)!;
            this.dice.player = this;
      }

      async setCharacter(character: Node, characterItem: Node, sendToServer: boolean) {
            const characterPlace = this.desk!.characterCard
            const itemPlace = this.desk!.characterItemCard
            this.soulsLayout = this.desk!.soulsLayout

            character.removeFromParent()
            // characterPlace.addChild(character)
            character.setParent(characterPlace);
            character.setPosition(0, 0)

            characterPlace?.getComponent(Sprite)?.destroy()

            characterItem.setParent(itemPlace)
            characterItem.setPosition(0, 0)

            itemPlace?.getComponent(Sprite)?.destroy()

            character.getComponent(Character)!.player = this

            this._Hp = character.getComponent(Character)!.hp;
            this.damage = character.getComponent(Character)!.damage;
            this.calculateDamage()
            this.character = character;
            this.characterItem = characterItem;
            this.cards.push(character, characterItem);
            this.addActiveItems([character]);
            await this.addItemByType(characterItem, sendToServer);

            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.ASSIGN_CHAR_TO_PLAYER, { playerId: this.playerId, charCardId: character.getComponent(Card)!._cardId, itemCardId: characterItem.getComponent(Card)!._cardId })

            }
            const charItemItemComp = characterItem.getComponent(Item)!;
            if ((charItemItemComp.type == ITEM_TYPE.PASSIVE ||
                  charItemItemComp.type == ITEM_TYPE.ACTIVE_AND_PASSIVE ||
                  charItemItemComp.type == ITEM_TYPE.PASSIVE_AND_PAID)
                  && sendToServer) {

                  const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ADD_ITEM, [characterItem], null, this.node)
                  if (this.node == WrapperProvider.playerManagerWrapper.out.mePlayer) {
                        passiveMeta.result = true
                        passiveMeta.result = await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
                  }
            }

      }

      @property
      me = false;

      async addItemByType(characterItem: Node, sendToServer: boolean) {
            switch (characterItem.getComponent(Item)!.type) {
                  case ITEM_TYPE.ACTIVE:
                        this.addActiveItems([characterItem]);
                        break;
                  case ITEM_TYPE.PASSIVE:
                        this.addPassiveItems([characterItem]);
                        await WrapperProvider.passiveManagerWrapper.out.registerPassiveItem(characterItem, sendToServer);
                        break;
                  case ITEM_TYPE.PAID:
                        this.addPaidItems([characterItem]);
                        break;
                  case ITEM_TYPE.ACTIVE_AND_PASSIVE:
                        this.addPassiveItems([characterItem]);
                        this.addActiveItems([characterItem]);
                        await WrapperProvider.passiveManagerWrapper.out.registerPassiveItem(characterItem, sendToServer);
                        break;
                  case ITEM_TYPE.ACTIVE_AND_PAID:
                        this.addActiveItems([characterItem]);
                        this.addPaidItems([characterItem]);
                        break;
                  case ITEM_TYPE.PASSIVE_AND_PAID:
                        this.addPassiveItems([characterItem]);
                        this.addPaidItems([characterItem]);
                        await WrapperProvider.passiveManagerWrapper.out.registerPassiveItem(characterItem, sendToServer);
                        break;
                  case ITEM_TYPE.ALL:
                        this.addActiveItems([characterItem]);
                        this.addPassiveItems([characterItem]);
                        await WrapperProvider.passiveManagerWrapper.out.registerPassiveItem(characterItem, sendToServer);
                        this.addPaidItems([characterItem]);
                        break;
                  default:
                        break;
            }
      }

      // LIFE-CYCLE CALLBACKS:

      onLoad() {
            this.activeItems = new Set();
            this.paidItems = new Set();
            this.passiveItems = new Set();
            this.deskCards = new Set();
            this.handCards = new Set();
            this.soulCards = new Set();
      }

      // eslint-disable-next-line 
      start() { }

      // update (dt) {}
}
