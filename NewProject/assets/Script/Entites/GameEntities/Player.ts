import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import ChooseCard from "../../CardEffectComponents/DataCollector/ChooseCard";
import { IMultiEffectRollAndCollect } from "../../CardEffectComponents/MultiEffectChooser/IMultiEffectRollAndCollect";
import MultiEffectChoose from "../../CardEffectComponents/MultiEffectChooser/MultiEffectChoose";
import MultiEffectRoll from "../../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import RollDice from "../../CardEffectComponents/RollDice";
import { BUTTON_STATE, CARD_TYPE, CHOOSE_CARD_TYPE, GAME_EVENTS, ITEM_TYPE, PARTICLE_TYPES, PASSIVE_EVENTS, ROLL_TYPE, TIME_TO_REACT_ON_ACTION } from "../../Constants";
import BattleManager from "../../Managers/BattleManager";
import ButtonManager from "../../Managers/ButtonManager";
import CardManager from "../../Managers/CardManager";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import ParticleManager from "../../Managers/ParticleManager";
import PassiveManager, { PassiveMeta } from "../../Managers/PassiveManager";
import PileManager from "../../Managers/PileManager";
import PlayerManager from "../../Managers/PlayerManager";
import TurnsManager from "../../Managers/TurnsManager";
import ActivateItem from "../../StackEffects/Activate Item";
import AttackRoll from "../../StackEffects/Attack Roll";
import DeclareAttack from "../../StackEffects/Declare Attack";
import PlayLootCardStackEffect from "../../StackEffects/Play Loot Card";
import PlayerDeath from "../../StackEffects/Player Death";
import PurchaseItem from "../../StackEffects/Purchase Item";
import StartTurnLoot from "../../StackEffects/Start Turn Loot";
import CardEffect from "../CardEffect";
import { CardLayout } from "../CardLayout";
import Character from "../CardTypes/Character";
import Item from "../CardTypes/Item";
import Monster from "../CardTypes/Monster";
import { Logger } from "../Logger";
import MonsterCardHolder from "../MonsterCardHolder";
import MonsterField from "../MonsterField";
import PlayerDesk from "../PlayerDesk";
import Stack from "../Stack";
import Card from "./Card";
import Deck from "./Deck";
import Dice from "./Dice";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {

  toString() {
    return "Player " + this.playerId;
  }

  @property
  playerId: number = 0;

  @property
  playerServerId: number = 0;

  @property(cc.Node)
  handNode: cc.Node = null;

  @property(cc.Component)
  hand: CardLayout = null;

  handCards: cc.Node[] = [];

  @property(cc.Component)
  dice: Dice = null;

  @property(cc.Node)
  selectedCard: cc.Node = null;

  @property
  character: cc.Node = null;

  @property
  characterItem: cc.Node = null;

  @property
  activeItems: cc.Node[] = [];

  @property
  passiveItems: cc.Node[] = [];

  @property
  desk: PlayerDesk = null;

  @property
  soulsLayout: cc.Node = null;

  @property
  souls: number = 0;

  @property
  _putCharLeft: boolean = false;

  deskCards: cc.Node[] = [];

  @property
  lootCardPlays: number = 1;

  @property
  drawPlays: number = 1;

  @property
  buyPlays: number = 1;

  @property
  attackPlays: number = 1;

  @property
  coins: number = 0;

  @property
  _Hp: number = 0;

  @property
  _lastHp: number = 0;

  @property
  _hpBonus: number = 0

  @property
  _tempHpBonus: number = 0

  @property
  damage: number = 0;

  @property
  baseDamage: number = 0;

  @property
  tempBaseDamage: number = 0;

  @property
  nonAttackRollBonus: number = 0;

  @property
  tempNonAttackRollBonus: number = 0;

  @property
  attackRollBonus: number = 0;

  @property
  tempAttackRollBonus: number = 0;

  @property
  firstAttackRollBonus: number = 0;

  @property
  tempFirstAttackRollBonus: number = 0;

  @property
  reactCardNode: cc.Node[] = [];

  @property
  reactionData = null;

  @property
  _reactionToggle: cc.Toggle = null;

  @property
  cards: cc.Node[] = [];

  @property
  _lootCardsPlayedThisTurn: cc.Node[] = []

  @property
  cardActivated: boolean = false;

  @property
  activatedCard: cc.Node = null;

  @property
  timeToRespondTimeOut = null;

  @property
  _hasPriority: boolean = false;

  @property
  _askingPlayerId: number = 0;

  set hasPlayerSelectedYesNo(bool: boolean) {
    whevent.emit(GAME_EVENTS.PLAYER_SELECTED_YES_NO, bool)
  }

  @property
  _playerYesNoDecision: boolean = false;

  @property
  _curses: cc.Node[] = [];

  @property
  hpLable: cc.Label = null;

  @property
  _dmgPrevention: number[] = [];

  @property
  _isFirstAttackRollOfTurn: boolean = true;

  @property
  _isFirstTimeGettingMoney: boolean = true;

  @property
  _thisTurnKiller: cc.Node = null;

  @property
  setDiceAdmin: number = 0;

  @property
  _isDead: boolean = false;

  /// Admin Methods Only!

  broadcastUpdateProperites(propertiesToChange) {
    ServerClient.$.send(Signal.PLAYER_PROP_UPDATE, { properties: propertiesToChange, playerId: this.playerId })
  }

  updateProperties(propertiesToChange) {

    for (const key of Object.keys(propertiesToChange)) {
      for (const key2 of Object.keys(this)) {
        if (key == key2) {
          cc.log(this[key2])
          this[key2] = propertiesToChange[key]
          break
        }
      }
    }

  }

  async giveCard(card: cc.Node) {
    card.parent = cc.find(`Canvas`)
    await CardManager.moveCardTo(card, this.hand.node, true, true)
    switch (card.getComponent(Card).type) {
      case CARD_TYPE.LOOT:
        await this.gainLoot(card, true)
        break;
      case CARD_TYPE.TREASURE:
        await this.addItem(card, true, true)
        break
      case CARD_TYPE.MONSTER:
        await MonsterField.addMonsterToExsistingPlace(MonsterField.getMonsterCardHoldersIds()[0], card, true)
        break;
      default:
        break;
    }
  }

  ///

  async assignChar(charCard: cc.Node, itemCard: cc.Node) {
    CardManager.onTableCards.push(charCard, itemCard);
    await this.setCharacter(charCard, itemCard);
    this.activeItems.push(charCard);
    if (
      itemCard.getComponent(Item).type == ITEM_TYPE.ACTIVE ||
      itemCard.getComponent(Item).type == ITEM_TYPE.BOTH
    ) {
      this.activeItems.push(itemCard);
    } else {
      this.passiveItems.push(itemCard);
    }
    // this.hpLable = cc.find(`Canvas/P${this.playerId} HP`).getComponent(cc.Label)
    //    this.hpLable.string = `${charCard.getComponent(Character).Hp}♥`
  }

  async drawCard(deck: cc.Node, sendToServer: boolean, alreadyDrawnCard?: cc.Node) {
    let drawnCard: cc.Node
    if (alreadyDrawnCard != null) {

      drawnCard = alreadyDrawnCard
    } else {
      drawnCard = deck.getComponent(Deck).drawCard(sendToServer);
    }
    drawnCard.setPosition(CardManager.lootDeck.getPosition());
    drawnCard.parent = cc.find("Canvas");
    if (sendToServer) {
      await CardManager.moveCardTo(drawnCard, this.hand.node, sendToServer, false, -1, CardManager.lootDeck.getPosition())
      const serverData = {
        signal: Signal.CARD_DRAWN,
        srvData: { playerId: this.playerId, deckType: CARD_TYPE.LOOT, drawnCardId: drawnCard.getComponent(Card)._cardId },
      };
      ServerClient.$.send(serverData.signal, serverData.srvData)
      if (drawnCard.getComponent(Card)._isFlipped) {
        drawnCard.getComponent(Card).flipCard(sendToServer)
      }
      await this.gainLoot(drawnCard, true)

    }

    // ActionManager
  }

  async declareAttack(
    monsterCard: cc.Node,
    sendToServer: boolean,
  ) {
    if (sendToServer) {
      const declareAttack = new DeclareAttack(this.character.getComponent(Card)._cardId, this, monsterCard)
      await Stack.addToStack(declareAttack, true)
    }
  }

  async giveYesNoChoice() {

    if (CardPreviewManager.isOpen) {

      ButtonManager.moveButton(ButtonManager.$.NoButton, ButtonManager.$.cardPreviewButtonLayout)
      ButtonManager.moveButton(ButtonManager.$.yesButton, ButtonManager.$.cardPreviewButtonLayout)
    } else {

      ButtonManager.moveButton(ButtonManager.$.NoButton, ButtonManager.$.playerButtonLayout)
      ButtonManager.moveButton(ButtonManager.$.yesButton, ButtonManager.$.playerButtonLayout)
    }

    ButtonManager.enableButton(ButtonManager.$.NoButton, BUTTON_STATE.CHANGE_TEXT, ["No"])
    ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.CHANGE_TEXT, ["Yes"])

    ButtonManager.enableButton(ButtonManager.$.NoButton, BUTTON_STATE.PLAYER_CHOOSE_NO, [this])
    ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.PLAYER_CHOOSE_YES, [this])

    const choice = await this.waitForPlayerYesNoSelection()

    ButtonManager.enableButton(ButtonManager.$.NoButton, BUTTON_STATE.CHANGE_TEXT, ["SKIP"])
    ButtonManager.enableButton(ButtonManager.$.NoButton, BUTTON_STATE.DISABLED)
    ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.DISABLED)
    return choice;
  }

  async giveNextClick() {

    ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.CHANGE_TEXT, ["Next"])
    ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.PLAYER_CLICKS_NEXT)
    await this.waitForNextClick()
    ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.DISABLED)

  }

  async waitForNextClick() {

    return new Promise((resolve) => {
      whevent.onOnce(GAME_EVENTS.PLAYER_CLICKED_NEXT, () => {
        resolve();
      })
    });
  }

  async waitForPlayerYesNoSelection(): Promise<boolean> {

    return new Promise((resolve) => {
      whevent.onOnce(GAME_EVENTS.PLAYER_SELECTED_YES_NO, (data: any) => {
        if (data) {
          resolve(this._playerYesNoDecision);
        }
      });

    })
  }

  calculateDamage() {
    let damage = 0;
    damage += this.baseDamage;
    damage += this.tempBaseDamage;
    damage += this.character.getComponent(Character).damage;
    // items that increase damage should increase baseDamage
    return damage;
  }

  calculateFinalRoll(rolledNumber: number, rollType: ROLL_TYPE) {
    let endRollNumber: number = 0;
    switch (rollType) {
      case ROLL_TYPE.ATTACK:
        endRollNumber += rolledNumber + this.attackRollBonus + this.tempAttackRollBonus
        break;
      case ROLL_TYPE.FIRST_ATTACK:
        endRollNumber += rolledNumber + this.attackRollBonus + this.tempAttackRollBonus + this.firstAttackRollBonus + this.tempFirstAttackRollBonus;
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

  async rollDice(rollType: ROLL_TYPE, numberRolled?: number) {
    const playerDice = this.dice;
    let newNumberRolled: number
    if (numberRolled == null) {
      ServerClient.$.send(Signal.ROLL_DICE, { playerId: this.playerId });
      numberRolled = await playerDice.rollDice(rollType);
      ServerClient.$.send(Signal.ROLL_DICE_ENDED, {
        playerId: this.playerId,
        numberRolled: numberRolled,
      });

    }
    newNumberRolled = numberRolled;
    return newNumberRolled
  }

  async rollAttackDice(sendToServer: boolean) {
    this.dice.getComponentInChildren(RollDice).rollType = ROLL_TYPE.ATTACK;
    if (sendToServer) {
      const attackRoll = new AttackRoll(this.character.getComponent(Card)._cardId, this.node, BattleManager.currentlyAttackedMonster.node)
      await Stack.addToStack(attackRoll, true)
    }

  }

  async loseLoot(loot: cc.Node, sendToServer: boolean) {
    this.hand.removeCardFromLayout(loot)
    this.handCards.splice(this.handCards.indexOf(loot), 1)
    const serverData = {
      signal: Signal.PLAYER_LOSE_LOOT,
      srvData: { playerId: this.playerId, cardId: loot.getComponent(Card)._cardId },
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
  }

  async gainLoot(loot: cc.Node, sendToServer: boolean) {
    this.hand.addCardToLayout(loot)
    loot.getComponent(Card)._ownedBy = this;
    this.handCards.push(loot)
    if (loot.getComponent(Card)._isFlipped) {
      if (this.playerId == PlayerManager.mePlayer.getComponent(Player).playerId) {
        loot.getComponent(Card).flipCard(sendToServer)
      }
    } else {
      if (this.playerId != PlayerManager.mePlayer.getComponent(Player).playerId) {
        loot.getComponent(Card).flipCard(sendToServer)
      }
    }
    const serverData = {
      signal: Signal.PLAYER_GET_LOOT,
      srvData: { playerId: this.playerId, cardId: loot.getComponent(Card)._cardId },
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
  }

  async discardLoot(lootCard: cc.Node, sendToServer: boolean) {
    lootCard.getComponent(Card)._ownedBy = null;
    if (sendToServer) {
      await this.loseLoot(lootCard, sendToServer)
    }
    const playerId = this.playerId;
    // let discardAction = new MoveLootToPile(
    //   { lootCard: lootCard },
    //   this.playerId
    // );
    if (sendToServer) {
      //  await CardManager.moveCardTo(lootCard, PileManager.lootCardPileNode, sendToServer)
      await PileManager.addCardToPile(CARD_TYPE.LOOT, lootCard, sendToServer)
    }
    const cardId = lootCard.getComponent(Card)._cardId;
    const serverData = {
      signal: Signal.DISCARD_LOOT,
      srvData: { playerId: playerId, cardId: cardId },
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    // let bool = await ActionManager.showSingleAction(
    //   discardAction,
    //   serverData,
    //   sendToServer
    // );
  }

  async buyItem(itemToBuy: cc.Node, sendToServer: boolean) {

    if (sendToServer) {
      const purchaseItem = new PurchaseItem(this.character.getComponent(Card)._cardId, itemToBuy, this.playerId)

      await Stack.addToStack(purchaseItem, sendToServer)
    }
  }

  async addItem(itemToAdd: cc.Node, sendToServer: boolean, isReward: boolean) {

    let itemCardComp: Card = itemToAdd.getComponent(Card);
    const treasureDeck = CardManager.treasureDeck;
    if (itemToAdd == treasureDeck.getComponent(Deck).topBlankCard) {
      itemToAdd = treasureDeck.getComponent(Deck).drawCard(sendToServer);
      itemCardComp = itemToAdd.getComponent(Card);
    }
    const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ADD_ITEM, [itemToAdd], null, this.node)
    if (sendToServer) {
      const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
      itemToAdd = afterPassiveMeta.args[0]
      itemCardComp = itemToAdd.getComponent(Card);
    }

    const playerId = this.playerId;
    const cardId = itemCardComp._cardId;
    const cardItemComp = itemToAdd.getComponent(Item);
    switch (cardItemComp.type) {
      case ITEM_TYPE.ACTIVE:
      case ITEM_TYPE.PAID:
        this.activeItems.push(itemToAdd);
        break;
      case ITEM_TYPE.PASSIVE:
        this.passiveItems.push(itemToAdd);
        await PassiveManager.registerPassiveItem(itemToAdd, sendToServer);
        break;
      case ITEM_TYPE.BOTH:
        this.activeItems.push(itemToAdd);
        this.passiveItems.push(itemToAdd);
        await PassiveManager.registerPassiveItem(itemToAdd, sendToServer);
        break;
      default:
        break;
    }
    this.cards.push(itemToAdd);
    itemToAdd.getComponent(Item).lastOwnedBy = this
    const serverData = {
      signal: Signal.ADD_AN_ITEM,
      srvData: { playerId, cardId, isReward },
    };
    if (sendToServer) {

      await CardManager.moveCardTo(itemCardComp.node, this.desk.node, sendToServer, true)
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    await this.desk.addToDesk(itemToAdd.getComponent(Card))
    CardManager.makeCardPreviewable(itemToAdd)
    CardManager.makeItemActivateable(itemToAdd)
    passiveMeta.result = true

    // do passive effects after!
    if (sendToServer) {

      passiveMeta.result = await PassiveManager.testForPassiveAfter(passiveMeta)
    }
    return passiveMeta.result

  }

  async playLootCard(lootCard: cc.Node, sendToServer: boolean) {
    const playerId = this.playerId;
    const cardId = lootCard.getComponent(Card)._cardId;
    //    let action = new MoveLootToPile({ lootCard: lootCard }, playerId);
    if (sendToServer) {
      let hasLockingEffect: boolean;
      const collector = lootCard.getComponent(CardEffect).multiEffectCollector;
      if (collector != null && !(collector instanceof MultiEffectChoose)) {
        hasLockingEffect = true;
      } else { hasLockingEffect = false; }
      if (this.playerId == TurnsManager.currentTurn.PlayerId && TurnsManager.currentTurn.lootCardPlays > 0) {
        TurnsManager.currentTurn.lootCardPlays -= 1
      }
      const playLoot = new PlayLootCardStackEffect(this.character.getComponent(Card)._cardId, hasLockingEffect, lootCard, this.character, false, false)
      await Stack.addToStack(playLoot, sendToServer)

    } else {
      if (lootCard.getComponent(Card)._isFlipped) {
        lootCard.getComponent(Card).flipCard(sendToServer);
      }
    }
  }

  /**
   * !!!!!!!!!! Don't put await infront of this function!!!!!!!!!!!!!
   * @param killerCard who killed the monster
   */
  async killPlayer(sendToServer: boolean, killerCard: cc.Node) {

    if (this._isDead) {
      cc.error(`player is dead and can't be killed again`)
      return
    }

    if (sendToServer) {

      const playerDeath = new PlayerDeath(this.character.getComponent(Card)._cardId, this.character, killerCard)
      await Stack.addToStackAbove(playerDeath)
      // if (addBelow) {
      //  await Stack.addToStackBelow(playerDeath, stackEffectToAddBelowTo, false)

    }

  }
  async removeCurse(curseCard: cc.Node, sendToServer: boolean) {
    if (sendToServer) {
      await this.destroyItem(curseCard, sendToServer)
    }
  }

  async payPenalties(sendToServer: boolean) {

    // lose 1 coin
    if (this.coins > 0) {
      this.coins -= 1;
    }
    // lose 1 loot if you have any
    if (this.handCards.length > 0) {
      const chooseCard = new ChooseCard();
      const cardToChooseFrom = chooseCard.getCardsToChoose(
        CHOOSE_CARD_TYPE.MY_HAND,
        this,
      );
      const chosenData = await chooseCard.requireChoosingACard(cardToChooseFrom)
      const chosenCard = CardManager.getCardById(chosenData.cardChosenId);
      await this.loseLoot(chosenCard, true)
      await PileManager.addCardToPile(CARD_TYPE.LOOT, chosenCard, true)
    }

    const nonEternalItems = this.deskCards.filter(
      card => (!card.getComponent(Item).eternal)
    );
    // lose 1 non-eternal item if you have any
    if (nonEternalItems.length > 0) {
      const chooseCard = new ChooseCard();
      const cardToChooseFrom = chooseCard.getCardsToChoose(
        CHOOSE_CARD_TYPE.MY_NON_ETERNALS,
        this,
      );
      const chosenData = await chooseCard.requireChoosingACard(cardToChooseFrom);

      const chosenCard = CardManager.getCardById(chosenData.cardChosenId);
      await this.loseItem(chosenCard, true)
      await PileManager.addCardToPile(chosenCard.getComponent(Card).type, chosenCard, true)
    }

    this.activeItems.forEach(item => item.getComponent(Item).useItem(true))
    return true
  }

  async destroyItem(itemToDestroy: cc.Node, sendToServer: boolean) {

    await this.loseItem(itemToDestroy, sendToServer)
    await PileManager.addCardToPile(CARD_TYPE.TREASURE, itemToDestroy, sendToServer);
  }

  itemsLostThisTurn: cc.Node[] = []

  async loseItem(itemToLose: cc.Node, sendToServer: boolean) {
    let passiveMeta: PassiveMeta
    if (sendToServer) {
      passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_LOSE_ITEM, [itemToLose], null, this.node)
      const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
      passiveMeta.args = afterPassiveMeta.args;
      itemToLose = afterPassiveMeta.args[0]
    }
    this.itemsLostThisTurn.push(itemToLose)
    this.deskCards = this.deskCards.filter(item => item != itemToLose)
    this.activeItems = this.activeItems.filter(item => item != itemToLose)
    this.passiveItems = this.passiveItems.filter(item => item != itemToLose)
    if (sendToServer) {
      PassiveManager.removePassiveItemEffects(itemToLose, true)
    }

    if (sendToServer) {
      await PassiveManager.testForPassiveAfter(passiveMeta)
    }
  }

  async startTurn(numOfCardToDraw: number, numberOfItemsToCharge: number, sendToServer: boolean) {

    if (Stack._currentStack.length > 0) {
      cc.log(`wait for stack to be emptied`)
      cc.log(Stack._currentStack)
      await Stack.waitForStackEmptied()
    }

    if (sendToServer) {

      // recharge items
      if (numberOfItemsToCharge == this.activeItems.length) {
        for (const item of this.activeItems) {
          if (item.getComponent(Item).activated) {
            await this.rechargeItem(item, sendToServer)
          }
        }
      } else {
        const chooseCard = new ChooseCard();
        for (let i = 0; i < numberOfItemsToCharge; i++) {
          const cardChosenData = await chooseCard.requireChoosingACard(this.activeItems)
          const item = CardManager.getCardById(cardChosenData.cardChosenId, true).getComponent(Item)
          if (item.activated) {
            await this.rechargeItem(item.node, sendToServer)
          }
        }
      }

      // add passive check for "Start of turn" Effects.

      await this.givePriority(true)
      const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_START_TURN, [numOfCardToDraw], null, this.node)
      if (sendToServer) {
        const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        passiveMeta.args = afterPassiveMeta.args;
        numOfCardToDraw = afterPassiveMeta.args[0]
      }

      // put loot 1 on the stack for the player

      for (let i = 0; i < numOfCardToDraw; i++) {
        const turnDraw = new StartTurnLoot(this.character.getComponent(Card)._cardId, this.character)

        await Stack.addToStack(turnDraw, true)
        // await this.drawCard(CardManager.lootDeck, sendToServer)
      }
    }

  }

  /**
   * @async dont put await before this function, this will run only when the stack was emptied.
   * @param sendToServer
   */

  isEndTurnRunning: boolean = false;

  async endTurn(sendToServer: boolean) {

    if (this.isEndTurnRunning) { return }
    this.isEndTurnRunning = true
    if (Stack._currentStack.length > 0) {
      await Stack.waitForStackEmptied()
    }

    // end of turn passive effects should trigger
    if (sendToServer) {

      const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_END_TURN, [], null, this.node)
      const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
      passiveMeta.args = afterPassiveMeta.args;
      await this.givePriority(true)
      // effect that last to end of turn wear off.
      PassiveManager.oneTurnAfterEffects = [];
      PassiveManager.oneTurnBeforeEffects = [];
    }
    cc.log(Stack._currentStack)
    await TurnsManager.nextTurn();
    this.isEndTurnRunning = false
    /// add a check if you have more than 10 cards discard to 10.
    return true
  }

  async addDamagePrevention(dmgToPrevent: number, sendToServer: boolean) {
    this._dmgPrevention.push(dmgToPrevent)
    if (sendToServer) {
      ServerClient.$.send(Signal.PLAYER_ADD_DMG_PREVENTION, { playerId: this.playerId, dmgToPrevent: dmgToPrevent })
    }
  }

  async preventDamage(incomingDamage: number) {
    if (this._dmgPrevention.length > 0) {
      // cc.log(`doing dmg prevention`)
      const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_PREVENT_DAMAGE, null, null, this.node)
      this._dmgPrevention.sort((a, b) => a - b)
      let newDamage = incomingDamage

      while (this._dmgPrevention.length > 0) {
        if (newDamage == 0) {
          return 0;
        } else {
          if (this._dmgPrevention.includes(newDamage)) {
            const dmgPreventionInstance = this._dmgPrevention.splice(this._dmgPrevention.indexOf(newDamage), 1)
            //   cc.error(`prevented exactly ${dmgPreventionInstance[0]} dmg`)
            newDamage -= dmgPreventionInstance[0]

            continue;
          } else {
            const instance = this._dmgPrevention.shift()
            cc.error(`prevented ${instance} dmg`)
            newDamage -= instance
            continue;
          }
        }
      }

      passiveMeta.result = newDamage
      const thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
      if (thisResult == 0) {
        return 0
      } else { return thisResult }
    } else { return incomingDamage }
  }

  async heal(hpToHeal: number, sendToServer: boolean, healDown?: boolean) {
    this._lastHp = this._Hp;
    if (sendToServer) {
      ServerClient.$.send(Signal.PLAYER_HEAL, { playerId: this.playerId, hpToHeal: hpToHeal })
    }
    if (healDown) {
      this._Hp = hpToHeal
    } else {
      if (this._Hp + hpToHeal > this.character.getComponent(Character).Hp + this._hpBonus + this._tempHpBonus) {
        this._Hp = this.character.getComponent(Character).Hp + this._hpBonus + this._tempHpBonus
      } else {
        this._Hp += hpToHeal
      }
    }
  }

  @property
  _killer: cc.Node = null

  /**
   *
   * @param damage
   * @param sendToServer
   * @param damageDealer the card who deals the damage (character or monster)
   */
  async takeDamage(damage: number, sendToServer: boolean, damageDealer: cc.Node) {

    this._lastHp = this._Hp;

    if (!sendToServer) {
      if (this._Hp - damage < 0) {
        this._Hp = 0
      } else {
        this._Hp -= damage;
      }

      // this.hpLable.string = `${this._Hp}♥`
    } else {
      // Prevent Damage
      damage = await this.preventDamage(damage)
      if (damage == 0) {
        cc.log(`damage after reduction is 0`)
        return false
      }
      /////

      let toContinue = true
      const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_GET_HIT, [damage, damageDealer], null, this.node)
      if (sendToServer) {
        const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        passiveMeta.args = afterPassiveMeta.args;
        damage = afterPassiveMeta.args[0]
        toContinue = afterPassiveMeta.continue
      }

      if (toContinue) {

        if (this._Hp - passiveMeta.args[0] < 0) {
          this._Hp = 0
        } else {
          this._Hp -= passiveMeta.args[0]
        }
        ParticleManager.runParticleOnce(this.character, PARTICLE_TYPES.PLAYER_GET_HIT)
        // this.hpLable.string = `${this._Hp}♥`
        const serverData = {
          signal: Signal.PLAYER_GET_HIT,
          srvData: { playerId: this.playerId, damage: passiveMeta.args[0], damageDealerId: passiveMeta.args[1].getComponent(Card)._cardId },
        };
        if (sendToServer) {
          ServerClient.$.send(serverData.signal, serverData.srvData)
          if (this._Hp == 0 && this._lastHp != 0) {
            this._killer = damageDealer
            await this.killPlayer(true, damageDealer)
          }
        }

      }
      // let isDead = await this.checkIfDead();

      //  passiveMeta.result = isDead;
      if (sendToServer) {
        const thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
        // return the original or changed result!;
        return thisResult;
      }
    }
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
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  async gainDMG(DMGToGain: number, isTillEndOfTurn: boolean, sendToServer: boolean) {
    if (isTillEndOfTurn) {
      this.tempBaseDamage += DMGToGain
    } else { this.baseDamage += DMGToGain; }
    const serverData = {
      signal: Signal.PLAYER_GAIN_DMG,
      srvData: { playerId: this.playerId, DMGToGain: DMGToGain, isTemp: isTillEndOfTurn },
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
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
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  async gainAttackRollBonus(bonusToGain: number, isTillEndOfTurn: boolean, sendToServer: boolean) {
    if (isTillEndOfTurn) {
      this.tempAttackRollBonus += bonusToGain;
    } else { this.attackRollBonus += bonusToGain; }
    const serverData = {
      signal: Signal.PLAYER_GAIN_ATTACK_ROLL_BONUS,
      srvData: { playerId: this.playerId, bonusToGain: bonusToGain, isTemp: isTillEndOfTurn },
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
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
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  async rechargeItem(itemCard: cc.Node, sendToServer: boolean) {
    const item = itemCard.getComponent(Item);
    await item.rechargeItem(sendToServer);
    const serverData = {
      signal: Signal.PLAYER_RECHARGE_ITEM,
      srvData: { playerId: this.playerId, cardId: itemCard.getComponent(Card)._cardId },
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  async getMonsterRewards(monsterKilled: cc.Node, sendToServer: boolean) {
    const monster = monsterKilled.getComponent(Monster);
    const monsterReward = monster.reward;

    return new Promise((resolve) => resolve(true))
  }

  async activateCard(card: cc.Node) {
    const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ACTIVATE_ITEM, [card], null, this.node)
    const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
    card = afterPassiveMeta.args[0]

    let hasLockingEffect: boolean;
    const collector = card.getComponent(CardEffect).multiEffectCollector;
    if (collector != null && !(collector instanceof MultiEffectChoose)) {
      hasLockingEffect = true;
    } else { hasLockingEffect = false; }
    const activateItem = new ActivateItem(this.character.getComponent(Card)._cardId, hasLockingEffect, card, this.character, false)
    await Stack.addToStack(activateItem, true)

  }

  async getSoulCard(cardWithSoul: cc.Node, sendToServer: boolean) {

    this.souls += cardWithSoul.getComponent(Card).souls;
    const id = this.playerId;

    const serverData = {
      signal: Signal.GET_SOUL,
      srvData: { playerId: id, cardId: cardWithSoul.getComponent(Card)._cardId },
    };
    if (sendToServer) {
      await CardManager.moveCardTo(cardWithSoul, this.soulsLayout, true, true)
      cardWithSoul.setParent(this.soulsLayout)
      cardWithSoul.setPosition(0, 0)
      ServerClient.$.send(serverData.signal, serverData.srvData)
      // await this.waitForSoulCardMove()
      if (this.souls >= 4) {
        whevent.emit(GAME_EVENTS.GAME_OVER, this.playerId)
        // cc.find('MainScript').emit('gameOver', this.playerId)
      } else if (cardWithSoul.getComponent(Monster) && cardWithSoul.getComponent(Monster).monsterPlace != null) {
        await cardWithSoul.getComponent(Monster).monsterPlace.removeMonster(cardWithSoul, sendToServer);
      };
    }
  }

  async loseSoul(cardWithSoul: cc.Node, sendToServer: boolean) {

    this.souls -= cardWithSoul.getComponent(Card).souls;
    const id = this.playerId;

    const serverData = {
      signal: Signal.LOSE_SOUL,
      srvData: { playerId: id, cardId: cardWithSoul.getComponent(Card)._cardId },
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
      if (this.souls >= 4) {
        cc.find("MainScript").emit("gameOver", this.playerId)
      }
    }
  }

  givePriority(sendToServer: boolean) {
    this._hasPriority = true;
    for (const player of PlayerManager.players) {
      if (player.getComponent(Player).playerId != this.playerId) {
        player.getComponent(Player)._hasPriority = false;
      }
    }
    if (sendToServer) {
      ServerClient.$.send(Signal.GIVE_PLAYER_PRIORITY, { playerId: this.playerId })
    }
  }

  // Example for passives, any interaction for passives needs to be like this!
  async changeMoney(numOfCoins: number, sendToServer: boolean, isStartGame?: boolean) {
    // do passive effects b4
    let toContinue = true;
    const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_CHANGE_MONEY, Array.of(numOfCoins), null, this.node)
    if (sendToServer) {
      const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
      passiveMeta.args = afterPassiveMeta.args;
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

      if (sendToServer) {
        ServerClient.$.send(Signal.SET_MONEY, { playerId: this.playerId, numOfCoins: this.coins })
      }
    }
    // set the retun value of the original function as the result
    passiveMeta.result = null
    // do passive effects after!
    if (sendToServer) {
      passiveMeta.result = await PassiveManager.testForPassiveAfter(passiveMeta)
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

      ServerClient.$.send(Signal.SET_MONEY, { playerId: this.playerId, numOfCoins: numOfCoins })
    }
  }

  setDesk(desk: cc.Node) {
    this.desk = desk.getComponent(PlayerDesk);
    const characterLayout = this.desk.node.getChildByName("CharacterLayout");
    this.soulsLayout = characterLayout;
    this.desk._playerId = this.playerId
    this.desk.name = "Desk " + this.playerId
  }

  setHand(hand: cc.Node) {
    // this.node.addChild(hand);
    const handWidget: cc.Widget = hand.getComponent(cc.Widget);
    handWidget.updateAlignment();
    hand.getComponent(
      CardLayout,
    ).boundingBoxWithoutChildren = hand.getBoundingBoxToWorld();

    this.hand = hand.getComponent(CardLayout);
    this.hand.playerId = this.playerId;
  }

  calculateReactions() {
    this.reactCardNode = [];

    for (let i = 0; i < this.activeItems.length; i++) {
      const activeItem = this.activeItems[i].getComponent(Item);
      const cardEffectComp = activeItem.node.getComponent(CardEffect);
      try {
        if (!activeItem.activated && cardEffectComp.testEffectsPreConditions()) {
          this.reactCardNode.push(activeItem.node);
        }
      } catch (error) {
        cc.error(error)
        Logger.error(error)
      }
    }
    if (TurnsManager.currentTurn.PlayerId == this.playerId && TurnsManager.currentTurn.lootCardPlays > 0) {
      for (const handCard of this.handCards) {
        this.reactCardNode.push(handCard)
      }
      // if(this.reactCardNode.length == 0) this._reactionToggle.uncheck()
    }

  }

  showAvailableReactions() {
    for (let i = 0; i < this.reactCardNode.length; i++) {
      const card = this.reactCardNode[i];
      const s = cc.sequence(
        cc.fadeTo(0.5, 255 / 2),
        cc.fadeTo(0.5, 255),
        cc.fadeTo(0.5, 255 / 2),
        cc.fadeTo(0.5, 255),
      );
      s.setTag(12);
      card.runAction(s.repeatForever());
    }
  }

  hideAvailableReactions() {
    for (let i = 0; i < this.reactCardNode.length; i++) {
      const card = this.reactCardNode[i];
      card.stopActionByTag(12)
      card.runAction(cc.fadeTo(0.5, 255));
    }
  }

  respondWithNoAction(askingPlayerId: number) {
    this.hideAvailableReactions()
    if (this._inGetResponse) {
      this._inGetResponse = false;
    }
    if (this._responseTimeout != null) {
      clearTimeout(this._responseTimeout)

      this._responseTimeout = null;
    }
    whevent.emit(GAME_EVENTS.PLAYER_CARD_NOT_ACTIVATED)
    ButtonManager.enableButton(ButtonManager.$.skipButton, BUTTON_STATE.DISABLED)
    // cc.find('Canvas/SkipButton').off(cc.Node.EventType.TOUCH_START)
    if (askingPlayerId != this.playerId) { ServerClient.$.send(Signal.RESPOND_TO, { playerId: askingPlayerId, stackEffectResponse: false }) }
    // this._askingPlayerId = -1
  }

  @property
  _inGetResponse: boolean = false;

  @property
  _responseTimeout: NodeJS.Timeout = null;

  async getResponse(askingPlayerId: number) {
    if (askingPlayerId == -1) {
      throw new Error(`Get Response asked from id -1, shuold not happen`)
    }
    this._askingPlayerId = askingPlayerId
    this._inGetResponse = true
    Stack.hasAnyoneResponded = false;
    this.calculateReactions();
    if (this._reactionToggle.isChecked) {
      this._reactionToggle.node.once(cc.Node.EventType.TOUCH_START, () => {
        this.respondWithNoAction(this._askingPlayerId)
      })
    }

    // nothing to respond with or switch is off
    if (this.reactCardNode.length == 0 || !this._reactionToggle.isChecked || this._isDead) {
      if (this._askingPlayerId == this.playerId) {
        if (this._inGetResponse) {
          this._inGetResponse = false;
        }
        if (this._responseTimeout != null) {
          clearTimeout(this._responseTimeout)

          this._responseTimeout = null;
        }
        return false
      } else {
        this.respondWithNoAction(
          askingPlayerId,
        );
      }
    } else {
      const blockReactions = this.respondWithNoAction.bind(this)
      // if time is out send a no reaction taken message
      this._responseTimeout = setTimeout(
        blockReactions,
        TIME_TO_REACT_ON_ACTION * 1000,
        askingPlayerId,
      );
      // make skip btn skip and respond to the asking player that you didnt do anything
      ButtonManager.enableButton(ButtonManager.$.skipButton, BUTTON_STATE.SKIP_SKIP_RESPONSE, [this._responseTimeout, this, askingPlayerId])
      this.showAvailableReactions();
      for (let i = 0; i < this.reactCardNode.length; i++) {
        const card = this.reactCardNode[i];
        CardManager.disableCardActions(card);
        CardManager.makeCardReactable(card, this.node);
      }
      const activatedCard = await this.waitForCardActivation();
      if (!activatedCard) { return false }
      if (activatedCard != null) {
        clearTimeout(this._responseTimeout);
        if (this._askingPlayerId != this.playerId) {
          ServerClient.$.send(Signal.RESPOND_TO, { playerId: this._askingPlayerId, stackEffectResponse: true })
        }
        this._askingPlayerId = -1;
        ButtonManager.enableButton(ButtonManager.$.skipButton, BUTTON_STATE.DISABLED)
        this.hideAvailableReactions();

        if (activatedCard.getComponent(Item) != null) {
          await this.activateCard(activatedCard);
        } else {
          await this.playLootCard(activatedCard, true)
        }
      }
      this.activatedCard = null
      return true
    }
  }

  async waitForCardActivation(): Promise<cc.Node> {
    return new Promise((resolve) => {
      whevent.onOnce(GAME_EVENTS.PLAYER_CARD_ACTIVATED, (data) => {
        this.cardActivated = true;
        resolve(data);
      })
      whevent.onOnce(GAME_EVENTS.PLAYER_CARD_NOT_ACTIVATED, () => {
        resolve(null);
      })
    });
  }

  setDice(dice: cc.Node) {
    // this.node.addChild(dice);
    this.dice = dice.getComponent(Dice);
    this.dice.player = this;
  }

  async setCharacter(character: cc.Node, characterItem: cc.Node) {
    const characterPlace = this.desk.node.getChildByName("CharacterPlace");
    const itemPlace = this.desk.node.getChildByName("CharacterItem");
    this.soulsLayout = this.desk.node.getChildByName("SoulsLayout");

    character.removeFromParent()
    // characterPlace.addChild(character)
    character.setParent(characterPlace);
    character.setPosition(0, 0)

    characterItem.setParent(itemPlace)
    characterItem.setPosition(0, 0)

    this._Hp = character.getComponent(Character).Hp;
    this.damage = character.getComponent(Character).damage;
    this.character = character;
    this.characterItem = characterItem;
    this.cards.push(character, characterItem);

    const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ADD_ITEM, [characterItem], null, this.node)
    if (this.node == PlayerManager.mePlayer) {
      passiveMeta.result = true
      passiveMeta.result = await PassiveManager.testForPassiveAfter(passiveMeta)
    }
  }

  @property
  me: boolean = false;

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
  }

  start() { }

  // update (dt) {}
}
