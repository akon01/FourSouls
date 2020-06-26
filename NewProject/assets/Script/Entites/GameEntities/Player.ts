import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import ChooseCard from "../../CardEffectComponents/DataCollector/ChooseCard";
import { IMultiEffectRollAndCollect } from "../../CardEffectComponents/MultiEffectChooser/IMultiEffectRollAndCollect";
import MultiEffectChoose from "../../CardEffectComponents/MultiEffectChooser/MultiEffectChoose";
import MultiEffectRoll from "../../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import RollDice from "../../CardEffectComponents/RollDice";
import { BUTTON_STATE, CARD_TYPE, CHOOSE_CARD_TYPE, GAME_EVENTS, ITEM_TYPE, PARTICLE_TYPES, PASSIVE_EVENTS, ROLL_TYPE, TIME_TO_REACT_ON_ACTION, ANNOUNCEMENT_TIME } from "../../Constants";
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
import DecisionMarker from "../Decision Marker";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";
import Store from "./Store";
import SoundManager from "../../Managers/SoundManager";
import AnimationManager, { ANIM_COLORS } from "../../Managers/Animation Manager";
import { whevent } from "../../../ServerClient/whevent";
import AnnouncementLable from "../../LableScripts/Announcement Lable";
import ReactionToggle from "../Reaction Toggle";

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

  @property({ visible: false })
  character: cc.Node = null;

  @property({ visible: false })
  characterItem: cc.Node = null;

  @property({ visible: false })
  activeItems: cc.Node[] = [];

  @property({ visible: false })
  passiveItems: cc.Node[] = [];

  @property({ visible: false })
  paidItems: cc.Node[] = [];

  @property({ visible: false })
  desk: PlayerDesk = null;

  @property({ visible: false })
  soulsLayout: cc.Node = null;

  @property({ visible: false })
  souls: number = 0;

  @property({ visible: false })
  soulCards: cc.Node[] = []

  @property
  _extraSoulsNeededToWin: number = 0;

  @property
  _putCharLeft: boolean = false;

  deskCards: cc.Node[] = [];

  @property
  lootCardPlays: number = 0;

  @property
  drawPlays: number = 1;

  @property
  buyPlays: number = 0;

  @property
  attackPlays: number = 0;

  @property
  _attackDeckPlays: number = 1;

  @property
  _mustAttackPlays: number = 0;

  @property
  _mustDeckAttackPlays: number = 0;

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

  @property({ visible: false })
  currentDamage: number = 0

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
  _reactionToggle: ReactionToggle = null;

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

  @property
  _endTurnFlag: boolean = false;

  @property
  lastRoll: number = 0

  @property
  lastAttackRoll: number = 0

  @property
  storeCardCostReduction: number = 0

  @property({ visible: false })
  skipTurn: boolean = false;

  @property({ visible: false })
  isFirstHitInTurn: boolean = true

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

  getStoreCost() {
    return Store.storeCardsCost - this.storeCardCostReduction
  }

  chooseYesNo(event: cc.Event, choice: string) {
    //this._playerYesNoDecision = isYes
    cc.log(choice)
    let bool: boolean
    choice == "False" ? bool = false : bool = true
    cc.log(bool)
    whevent.emit(GAME_EVENTS.PLAYER_SELECTED_YES_NO, bool)

  }

  async giveCard(card: cc.Node) {
    card.parent = CardManager.$.onTableCardsHolder
    await CardManager.moveCardTo(card, this.hand.node, true, true)
    switch (card.getComponent(Card).type) {
      case CARD_TYPE.LOOT:
        CardManager.lootDeck.getComponent(Deck).drawSpecificCard(card, true)
        await this.gainLoot(card, true)
        break;
      case CARD_TYPE.TREASURE:
        CardManager.treasureDeck.getComponent(Deck).drawSpecificCard(card, true)
        await this.addItem(card, true, true)
        break
      case CARD_TYPE.MONSTER:
        CardManager.monsterDeck.getComponent(Deck).drawSpecificCard(card, true)
        await MonsterField.addMonsterToExsistingPlace(MonsterField.getMonsterCardHoldersIds()[0], card, true)
        break;
      default:
        break;
    }
  }

  ///

  // async assignChar(charCard: cc.Node, itemCard: cc.Node) {
  //   CardManager.onTableCards.push(charCard, itemCard);
  //   await this.setCharacter(charCard, itemCard);
  //   this.activeItems.push(charCard);
  //   if (
  //     itemCard.getComponent(Item).type == ITEM_TYPE.ACTIVE ||
  //     itemCard.getComponent(Item).type == ITEM_TYPE.BOTH
  //   ) {
  //     this.activeItems.push(itemCard);
  //   } else {
  //     this.passiveItems.push(itemCard);
  //   }
  //   // this.hpLable = cc.find(`Canvas/P${this.playerId} HP`).getComponent(cc.Label)
  //   //    this.hpLable.string = `${charCard.getComponent(Character).Hp}♥`
  // }

  async drawCard(deck: cc.Node, sendToServer: boolean, alreadyDrawnCard?: cc.Node) {


    let drawnCard: cc.Node
    if (alreadyDrawnCard != null) {

      drawnCard = alreadyDrawnCard
    } else {
      drawnCard = deck.getComponent(Deck).drawCard(sendToServer);
    }
    drawnCard.setPosition(CardManager.lootDeck.getPosition());
    drawnCard.parent = CardManager.$.onTableCardsHolder
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
      //await DecisionMarker.$.showDecision(this.character, monsterCard, true)
      const declareAttack = new DeclareAttack(this.character.getComponent(Card)._cardId, this, monsterCard)
      await Stack.addToStack(declareAttack, true)
    }
  }

  async giveYesNoChoice(flavorText: string) {
    cc.log(`give yes no choice`)
    if (!CardPreviewManager.isOpen && !StackEffectVisManager.$.isOpen) {
      ButtonManager.moveButton(ButtonManager.$.NoButton, ButtonManager.$.playerButtonLayout)
      ButtonManager.moveButton(ButtonManager.$.yesButton, ButtonManager.$.playerButtonLayout)
    } else {
      ButtonManager.moveButton(ButtonManager.$.NoButton, ButtonManager.$.cardPreviewButtonLayout)
      ButtonManager.moveButton(ButtonManager.$.yesButton, ButtonManager.$.cardPreviewButtonLayout)
    }
    ButtonManager.enableButton(ButtonManager.$.clearPreviewsButton, BUTTON_STATE.DISABLED)
    ButtonManager.enableButton(ButtonManager.$.NoButton, BUTTON_STATE.ENABLED)
    ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.ENABLED)
    ButtonManager.enableButton(ButtonManager.$.NoButton, BUTTON_STATE.PLAYER_CHOOSE_NO, [this])
    ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.PLAYER_CHOOSE_YES, [this])
    CardPreviewManager.setFalvorText(flavorText)
    const choice = await this.waitForPlayerYesNoSelection()
    CardPreviewManager.setFalvorText("")
    //  ButtonManager.enableButton(ButtonManager.$.NoButton, BUTTON_STATE.CHANGE_TEXT, ["SKIP"])
    ButtonManager.enableButton(ButtonManager.$.clearPreviewsButton, BUTTON_STATE.ENABLED)
    ButtonManager.enableButton(ButtonManager.$.NoButton, BUTTON_STATE.DISABLED)
    ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.DISABLED)
    ButtonManager.moveButton(ButtonManager.$.NoButton, ButtonManager.$.cardPreviewButtonLayout)
    ButtonManager.moveButton(ButtonManager.$.yesButton, ButtonManager.$.cardPreviewButtonLayout)
    if (!choice) {
      await CardPreviewManager.clearAllPreviews()
      CardPreviewManager.hidePreviewManager()
      StackEffectVisManager.$.hidePreviews()
    }
    return choice;
  }

  async giveNextClick(flavorText: string) {

    ButtonManager.enableButton(ButtonManager.$.clearPreviewsButton, BUTTON_STATE.DISABLED)
    ButtonManager.enableButton(ButtonManager.$.nextButton, BUTTON_STATE.ENABLED)
    ButtonManager.enableButton(ButtonManager.$.nextButton, BUTTON_STATE.PLAYER_CLICKS_NEXT, [this])
    CardPreviewManager.setFalvorText(flavorText)
    await this.waitForNextClick()
    CardPreviewManager.setFalvorText("")
    ButtonManager.enableButton(ButtonManager.$.nextButton, BUTTON_STATE.DISABLED)
    ButtonManager.enableButton(ButtonManager.$.clearPreviewsButton, BUTTON_STATE.ENABLED)

  }

  clickNext() {
    whevent.emit(GAME_EVENTS.PLAYER_CLICKED_NEXT)
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
      whevent.onOnce(GAME_EVENTS.PLAYER_SELECTED_YES_NO, (data: boolean) => {
        cc.log(`wait for player yes no selection ${data}`)
        resolve(Boolean(data));
      });

    })
  }

  calculateDamage() {
    let damage = 0;
    damage += this.baseDamage;
    damage += this.tempBaseDamage;
    if (this.character) {
      damage += this.character.getComponent(Character).damage;
    }
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
    const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_GAIN_LOOT, [loot], null, this.node)
    if (sendToServer) {
      const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
      loot = afterPassiveMeta.args[0]
    }
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
      await PassiveManager.testForPassiveAfter(passiveMeta)
    }
  }

  async discardLoot(lootCard: cc.Node, sendToServer: boolean) {
    const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_LOSE_LOOT, [lootCard], null, this.node)
    if (sendToServer) {
      const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
      lootCard = afterPassiveMeta.args[0]
    }
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
      await PassiveManager.testForPassiveAfter(passiveMeta)
    }
    // let bool = await ActionManager.showSingleAction(
    //   discardAction,
    //   serverData,
    //   sendToServer
    // );
  }

  async buyItem(itemToBuy: cc.Node, sendToServer: boolean) {

    if (sendToServer) {
      //await DecisionMarker.$.showDecision(this.character, itemToBuy, true)
      const purchaseItem = new PurchaseItem(this.character.getComponent(Card)._cardId, itemToBuy, this.playerId)

      await Stack.addToStack(purchaseItem, sendToServer)
    }
  }


  async addItem(itemToAdd: cc.Node, sendToServer: boolean, isReward: boolean) {
    let itemCardComp: Card = itemToAdd.getComponent(Card);
    const treasureDeck = CardManager.treasureDeck;
    if (itemToAdd == treasureDeck) {
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

    await this.addItemByType(cardItemComp.node, sendToServer)
    this.cards.push(itemToAdd);
    itemToAdd.getComponent(Item).lastOwnedBy = this
    const serverData = {
      signal: Signal.ADD_AN_ITEM,
      srvData: { playerId, cardId, isReward },
    };
    if (sendToServer) {

      await CardManager.moveCardTo(itemCardComp.node, this.desk.node, sendToServer, true)
      ServerClient.$.send(serverData.signal, serverData.srvData)
      CardManager.makeItemActivateable(itemToAdd)
    }
    await this.desk.addToDesk(itemToAdd.getComponent(Card))
    CardManager.makeCardPreviewable(itemToAdd)
    passiveMeta.result = true

    // do passive effects after!
    if (sendToServer) {
      cc.log(`test for passive after adding`)
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
      if (this == TurnsManager.currentTurn.getTurnPlayer() && this.lootCardPlays > 0) {
        this.lootCardPlays -= 1
      }
      // await DecisionMarker.$.showDecision(lootCard, lootCard, true, true)
      lootCard.getComponent(Card).isGoingToBePlayed = true
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
      Logger.error(`player ${this.playerId} is dead and can't be killed again`)
      return
    }
    if (sendToServer) {
      cc.error(`add player death to stack`)
      const playerDeath = new PlayerDeath(this.character.getComponent(Card)._cardId, this.character, killerCard)
      await Stack.addToStackAbove(playerDeath)
      // if (addBelow) {
      //  await Stack.addToStackBelow(playerDeath, stackEffectToAddBelowTo, false)

    }
  }

  addCurse(curseCard: cc.Node, sendToServer: boolean) {
    this._curses.push(curseCard)
    if (sendToServer) {
      ServerClient.$.send(Signal.PLAYER_ADD_CURSE, { playerId: this.playerId, cardId: curseCard.getComponent(Card)._cardId })
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
      await this.changeMoney(-1, true)
    }
    // lose 1 loot if you have any
    if (this.handCards.length > 0) {
      const chooseCard = new ChooseCard();
      chooseCard.playerId = this.playerId
      chooseCard.flavorText = "Choose A Loot To Discard"
      let chosenCard: cc.Node
      const cardToChooseFrom = chooseCard.getCardsToChoose(
        CHOOSE_CARD_TYPE.MY_HAND,
        this,
      );
      if (cardToChooseFrom.length == 1) {
        chosenCard = cardToChooseFrom[0]
      } else {
        const chosenData = await chooseCard.requireChoosingACard(cardToChooseFrom)
        chosenCard = CardManager.getCardById(chosenData.cardChosenId);
      }
      await this.loseLoot(chosenCard, true)
      await PileManager.addCardToPile(CARD_TYPE.LOOT, chosenCard, true)
    }

    const nonEternalItems = this.deskCards.filter(
      card => (!card.getComponent(Item).eternal)
    );
    // lose 1 non-eternal item if you have any
    if (nonEternalItems.length > 0) {
      const chooseCard = new ChooseCard();
      chooseCard.flavorText = "Choose An Item To Destroy"
      let chosenCard: cc.Node
      const cardToChooseFrom = chooseCard.getCardsToChoose(
        CHOOSE_CARD_TYPE.MY_NON_ETERNALS,
        this,
      );
      if (cardToChooseFrom.length == 1) {
        chosenCard = cardToChooseFrom[0]
      } else {
        const chosenData = await chooseCard.requireChoosingACard(cardToChooseFrom);
        chosenCard = CardManager.getCardById(chosenData.cardChosenId);
      }
      await this.loseItem(chosenCard, true)
      await PileManager.addCardToPile(chosenCard.getComponent(Card).type, chosenCard, true)
    }

    this.activeItems.forEach(item => item.getComponent(Item).useItem(true))
    return true
  }

  async destroyItem(itemToDestroy: cc.Node, sendToServer: boolean) {

    await this.loseItem(itemToDestroy, sendToServer)
    if (itemToDestroy.getComponent(Card).type == CARD_TYPE.LOOT) {
      await PileManager.addCardToPile(CARD_TYPE.LOOT, itemToDestroy, sendToServer);
    } else if (itemToDestroy.getComponent(Card).type == CARD_TYPE.CURSE || itemToDestroy.getComponent(Card).type == CARD_TYPE.MONSTER) {
      await PileManager.addCardToPile(CARD_TYPE.MONSTER, itemToDestroy, sendToServer);
    } else {
      await PileManager.addCardToPile(CARD_TYPE.TREASURE, itemToDestroy, sendToServer);
    }
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
    this.paidItems = this.paidItems.filter(item => item != itemToLose)
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

      if (this.skipTurn) {
        this.skipTurn = false;
        await this.endTurn(true)
        return
      }

      // recharge items
      if (numberOfItemsToCharge == this.activeItems.length) {
        for (const item of this.activeItems) {
          if (item.getComponent(Item).needsRecharge) {
            await this.rechargeItem(item, sendToServer)
          }
        }
      } else {
        const chooseCard = new ChooseCard();
        chooseCard.flavorText = "Choose Item To Recharge"
        for (let i = 0; i < numberOfItemsToCharge; i++) {
          const cardChosenData = await chooseCard.requireChoosingACard(this.activeItems)
          const item = CardManager.getCardById(cardChosenData.cardChosenId, true).getComponent(Item)
          if (item.needsRecharge) {
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
      ButtonManager.enableButton(ButtonManager.$.nextTurnButton, BUTTON_STATE.ENABLED)
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
    // if (Stack._currentStack.length > 0) {
    //   await Stack.waitForStackEmptied()
    // }
    this._endTurnFlag = false

    // end of turn passive effects should trigger
    if (sendToServer) {
      cc.log(`end turn`)

      const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_END_TURN, [], null, this.node)
      const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
      passiveMeta.args = afterPassiveMeta.args;
      await this.givePriority(true)
      // effect that last to end of turn wear off.
      PassiveManager.oneTurnAfterEffects = [];
      PassiveManager.oneTurnBeforeEffects = [];
      ButtonManager.enableButton(ButtonManager.$.nextTurnButton, BUTTON_STATE.DISABLED)
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
            newDamage -= instance
            continue;
          }
        }
      }

      passiveMeta.result = newDamage
      const thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
      AnnouncementLable.$.showAnnouncement(`${this.name} Prevented ${incomingDamage - thisResult} Damage`, ANNOUNCEMENT_TIME, true)
      if (thisResult <= 0) {
        return 0
      } else { return thisResult }
    } else { return incomingDamage }
  }

  heal(hpToHeal: number, sendToServer: boolean, healDown?: boolean) {
    this._lastHp = this._Hp;
    if (sendToServer) {
      ServerClient.$.send(Signal.PLAYER_HEAL, { playerId: this.playerId, hpToHeal: hpToHeal, healDown: healDown })
    }
    if (healDown) {
      this._Hp = hpToHeal
    } else {
      if (this._Hp + hpToHeal > this.character.getComponent(Character).hp + this._hpBonus + this._tempHpBonus) {
        this._Hp = this.character.getComponent(Character).hp + this._hpBonus + this._tempHpBonus
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
      const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_GET_HIT, [damage, damageDealer, this.isFirstHitInTurn], null, this.node)
      if (sendToServer) {
        const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        passiveMeta.args = afterPassiveMeta.args;
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
          ParticleManager.runParticleOnce(this.character, PARTICLE_TYPES.PLAYER_GET_HIT)
          SoundManager.$.playSound(SoundManager.$.playerGetHit)
          // this.hpLable.string = `${this._Hp}♥`
          const serverData = {
            signal: Signal.PLAYER_GET_HIT,
            srvData: { playerId: this.playerId, damage: damage, damageDealerId: passiveMeta.args[1].getComponent(Card)._cardId },
          };
          if (sendToServer) {
            ServerClient.$.send(serverData.signal, serverData.srvData)
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
        const thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
        // return the original or changed result!;
        if (damage > 0) {
          return true
        } else {
          return false;
        }
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
    } else {
      this.baseDamage += DMGToGain;

    }
    this.calculateDamage()
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

  rechargeItem(itemCard: cc.Node, sendToServer: boolean) {
    const item = itemCard.getComponent(Item);
    item.rechargeItem(sendToServer);
  }

  deactivateItem(itemCard: cc.Node, sendToServer: boolean) {
    const item = itemCard.getComponent(Item);
    item.useItem(sendToServer)
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
    //await DecisionMarker.$.showDecision(this.character, card, true)
    const activateItem = new ActivateItem(this.character.getComponent(Card)._cardId, hasLockingEffect, card, this.character, false)
    await Stack.addToStack(activateItem, true)

  }

  async getSoulCard(cardWithSoul: cc.Node, sendToServer: boolean) {

    this.soulCards.push(cardWithSoul)
    this.souls += cardWithSoul.getComponent(Card).souls;
    const id = this.playerId;

    const serverData = {
      signal: Signal.GET_SOUL,
      srvData: { playerId: id, cardId: cardWithSoul.getComponent(Card)._cardId },
    };
    if (sendToServer) {
      cc.error(`move card to`)
      await CardManager.moveCardTo(cardWithSoul, this.soulsLayout, true, true)
      cc.error(`after move card to`)
      cardWithSoul.setParent(this.soulsLayout)
      cardWithSoul.setPosition(0, 0)
      ServerClient.$.send(serverData.signal, serverData.srvData)
      // await this.waitForSoulCardMove()
      if (this.souls >= 4 + this._extraSoulsNeededToWin) {
        whevent.emit(GAME_EVENTS.GAME_OVER, this.playerId)
        // cc.find('MainScript').emit('gameOver', this.playerId)
      } else if (cardWithSoul.getComponent(Monster) && cardWithSoul.getComponent(Monster).monsterPlace != null) {
        await cardWithSoul.getComponent(Monster).monsterPlace.removeMonster(cardWithSoul, sendToServer);
      };
    }
  }

  loseSoul(cardWithSoul: cc.Node, sendToServer: boolean) {

    this.souls -= cardWithSoul.getComponent(Card).souls;
    this.soulCards = this.soulCards.filter(c => c != cardWithSoul)
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
      if (numOfCoins > 0) {
        SoundManager.$.playSound(SoundManager.$.coinGetSound)

      } else {
        SoundManager.$.playSound(SoundManager.$.coinLoseSound)
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
    const characterLayout = this.desk.soulsLayout;
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

    const reactableItems = [...this.activeItems, ...this.paidItems]

    for (let i = 0; i < reactableItems.length; i++) {
      const reactableItem = reactableItems[i].getComponent(Item);
      const cardEffectComp = reactableItem.node.getComponent(CardEffect);
      try {
        if (this.paidItems.includes(reactableItem.node) && cardEffectComp.testEffectsPreConditions(false)) {
          this.reactCardNode.push(reactableItem.node);
        } else if (!reactableItem.needsRecharge && cardEffectComp.testEffectsPreConditions(false)) {
          this.reactCardNode.push(reactableItem.node);
        }
      } catch (error) {
        Logger.error(error)
      }
    }
    if (TurnsManager.currentTurn.getTurnPlayer() == this && this.lootCardPlays > 0) {
      for (const handCard of this.handCards) {
        this.reactCardNode.push(handCard)
      }
      // if(this.reactCardNode.length == 0) this._reactionToggle.uncheck()
    }

  }

  showAvailableReactions() {
    for (let i = 0; i < this.reactCardNode.length; i++) {
      const card = this.reactCardNode[i];
      AnimationManager.$.showAnimation(card, ANIM_COLORS.BLUE)
    }
    ServerClient.$.send(Signal.SHOW_REACTIONS, { playerId: this.playerId, cardsIds: this.reactCardNode.map(card => card.getComponent(Card)._cardId) })
  }

  hideAvailableReactions() {
    for (let i = 0; i < this.reactCardNode.length; i++) {
      const card = this.reactCardNode[i];
      AnimationManager.$.endAnimation(card)
    }
    ServerClient.$.send(Signal.HIDE_REACTIONS, { playerId: this.playerId, cardsIds: this.reactCardNode.map(card => card.getComponent(Card)._cardId) })
  }

  skipButtonClicked(event: cc.Event) {
    this.respondWithNoAction()
  }

  respondWithNoAction() {
    cc.error(`respond with no action `)
    const askingPlayerId = this._askingPlayerId
    this.hideAvailableReactions()
    if (this._inGetResponse) {
      this._inGetResponse = false;
    }
    if (this._responseTimeout != null) {
      clearTimeout(this._responseTimeout)

      this._responseTimeout = null;
    }
    this._reactionToggle.removeRespondWithNoAction()
    AnnouncementLable.$.hideTimer(true)
    AnnouncementLable.$.hideAnnouncement(false)
    whevent.emit(GAME_EVENTS.PLAYER_CARD_NOT_ACTIVATED)
    ButtonManager.enableButton(ButtonManager.$.skipButton, BUTTON_STATE.DISABLED)
    // cc.find('Canvas/SkipButton').off(cc.Node.EventType.TOUCH_START)
    if (askingPlayerId != this.playerId) { ServerClient.$.send(Signal.RESPOND_TO, { playerId: askingPlayerId, stackEffectResponse: false }) }
    // this._askingPlayerId = -1
  }

  @property
  _inGetResponse: boolean = false;

  @property
  _responseTimeout = null;



  async getResponse(askingPlayerId: number) {
    if (askingPlayerId == -1) {
      throw new Error(`Get Response asked from id -1, shuold not happen`)
    }
    this._askingPlayerId = askingPlayerId
    this._inGetResponse = true
    Stack.hasAnyoneResponded = false;
    this.calculateReactions();
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
        this.respondWithNoAction();
      }
    } else {
      if (this._reactionToggle.isChecked) {
        ButtonManager.enableButton(ButtonManager.$.skipButton, BUTTON_STATE.ENABLED)
        this._reactionToggle.addRespondWithNoAction(this.node)
        // this._reactionToggle.node.once(cc.Node.EventType.TOUCH_START, () => {
        //   this.respondWithNoAction(this._askingPlayerId)
        // })
      }
      const blockReactions = this.respondWithNoAction.bind(this)
      // if time is out send a no reaction taken message
      AnnouncementLable.$.showTimer(TIME_TO_REACT_ON_ACTION, true)
      AnnouncementLable.$.showAnnouncement(`Choose A Reaction`, 0, false)
      this._responseTimeout = setTimeout(
        blockReactions,
        TIME_TO_REACT_ON_ACTION * 1000,
        askingPlayerId,
      );
      // make skip btn skip and respond to the asking player that you didnt do anything
      ButtonManager.enableButton(ButtonManager.$.skipButton, BUTTON_STATE.SKIP_SKIP_RESPONSE, [this._responseTimeout, this, askingPlayerId])
      for (let i = 0; i < this.reactCardNode.length; i++) {
        const card = this.reactCardNode[i];
        CardManager.disableCardActions(card);
        CardManager.makeCardReactable(card, this.node);
      }
      this.showAvailableReactions();
      const activatedCard = await this.waitForCardActivation();
      AnnouncementLable.$.hideTimer(true)
      AnnouncementLable.$.hideAnnouncement(false)
      ButtonManager.enableButton(ButtonManager.$.skipButton, BUTTON_STATE.DISABLED)
      if (!activatedCard) { return false }
      if (activatedCard != null) {
        this._reactionToggle.removeRespondWithNoAction()
        clearTimeout(this._responseTimeout);
        if (this._askingPlayerId != this.playerId) {
          ServerClient.$.send(Signal.RESPOND_TO, { playerId: this._askingPlayerId, stackEffectResponse: true })
        }
        this._askingPlayerId = -1;
        this.hideAvailableReactions();

        if (activatedCard.getComponent(Card).type != CARD_TYPE.LOOT) {
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

  async setCharacter(character: cc.Node, characterItem: cc.Node, sendToServer: boolean) {
    const characterPlace = this.desk.characterCard
    const itemPlace = this.desk.characterItemCard
    this.soulsLayout = this.desk.soulsLayout

    character.removeFromParent()
    // characterPlace.addChild(character)
    character.setParent(characterPlace);
    character.setPosition(0, 0)

    characterPlace.removeComponent(cc.Sprite)

    characterItem.setParent(itemPlace)
    characterItem.setPosition(0, 0)


    itemPlace.removeComponent(cc.Sprite)

    character.getComponent(Character).player = this

    this._Hp = character.getComponent(Character).hp;
    this.damage = character.getComponent(Character).damage;
    this.calculateDamage()
    this.character = character;
    this.characterItem = characterItem;
    this.cards.push(character, characterItem);
    this.activeItems.push(character);
    await this.addItemByType(characterItem, sendToServer);


    if (sendToServer) {
      ServerClient.$.send(Signal.ASSIGN_CHAR_TO_PLAYER, { playerId: this.playerId, charCardId: character.getComponent(Card)._cardId, itemCardId: characterItem.getComponent(Card)._cardId })

    }
    if ((characterItem.getComponent(Item).type == ITEM_TYPE.PASSIVE || characterItem.getComponent(Item).type == ITEM_TYPE.ACTIVE_AND_PASSIVE || characterItem.getComponent(Item).type == ITEM_TYPE.PASSIVE_AND_PAID) && sendToServer) {

      const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ADD_ITEM, [characterItem], null, this.node)
      if (this.node == PlayerManager.mePlayer) {
        passiveMeta.result = true
        passiveMeta.result = await PassiveManager.testForPassiveAfter(passiveMeta)
      }
    }



  }

  @property
  me: boolean = false;

  async addItemByType(characterItem: cc.Node, sendToServer: boolean) {
    switch (characterItem.getComponent(Item).type) {
      case ITEM_TYPE.ACTIVE:
        this.activeItems.push(characterItem);
        break;
      case ITEM_TYPE.PASSIVE:
        this.passiveItems.push(characterItem);
        await PassiveManager.registerPassiveItem(characterItem, sendToServer);
        break;
      case ITEM_TYPE.PAID:
        this.paidItems.push(characterItem);
        break;
      case ITEM_TYPE.ACTIVE_AND_PASSIVE:
        this.passiveItems.push(characterItem);
        this.activeItems.push(characterItem);
        await PassiveManager.registerPassiveItem(characterItem, sendToServer);
        break;
      case ITEM_TYPE.ACTIVE_AND_PAID:
        this.activeItems.push(characterItem);
        this.paidItems.push(characterItem);
        break;
      case ITEM_TYPE.PASSIVE_AND_PAID:
        this.passiveItems.push(characterItem);
        this.paidItems.push(characterItem);
        await PassiveManager.registerPassiveItem(characterItem, sendToServer);
        break;
      case ITEM_TYPE.ALL:
        this.activeItems.push(characterItem);
        this.passiveItems.push(characterItem);
        await PassiveManager.registerPassiveItem(characterItem, sendToServer);
        this.paidItems.push(characterItem);
        break;
      default:
        break;
    }
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
  }

  start() { }

  // update (dt) {}
}
