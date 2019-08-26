import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import ChooseCard from "../../CardEffectComponents/DataCollector/ChooseCard";
import MultiEffectRoll from "../../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import RollDice from "../../CardEffectComponents/RollDice";
import { CARD_TYPE, CARD_WIDTH, CHOOSE_CARD_TYPE, ITEM_TYPE, ROLL_TYPE, TIME_TO_REACT_ON_ACTION } from "../../Constants";
import BattleManager from "../../Managers/BattleManager";
import CardManager from "../../Managers/CardManager";
import CardPreviewManager from "../../Managers/CardPreviewManager";
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
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import StartTurnLoot from "../../StackEffects/Start Turn Loot";
import CardEffect from "../CardEffect";
import { CardLayout } from "../CardLayout";
import Character from "../CardTypes/Character";
import Item from "../CardTypes/Item";
import Monster from "../CardTypes/Monster";
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
  _hpBonus: number = 0

  @property
  damage: number = 0;

  @property
  baseDamage: number = 0;

  @property
  nonAttackRollBonus: number = 0;

  @property
  attackRollBonus: number = 0;

  @property
  firstAttackRollBonus: number = 0;

  @property
  reactCardNode: cc.Node[] = [];

  @property
  reactionData = null;

  @property
  _reactionToggle: cc.Toggle = null;

  @property
  cards: cc.Node[] = [];

  @property
  cardActivated: boolean = false;

  @property
  cardNotActivated: boolean = false;

  @property
  activatedCard: cc.Node = null;

  @property
  timeToRespondTimeOut = null;

  @property
  _hasPriority: boolean = false;

  @property
  _askingPlayerId: number = 0;

  @property
  _hasPlayerSelectedYesNo: boolean = false;

  @property
  _playerYesNoDecision: boolean = false;

  @property
  _curses: cc.Node[] = [];

  @property
  hpLable: cc.Label = null;

  assignChar(charCard: cc.Node, itemCard: cc.Node) {
    CardManager.onTableCards.push(charCard, itemCard);
    this.setCharacter(charCard, itemCard);
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
    this.hpLable.string = `${charCard.getComponent(Character).Hp}♥`
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
      let serverData = {
        signal: Signal.CARD_DRAWN,
        srvData: { playerId: this.playerId, deckType: CARD_TYPE.LOOT, drawnCardId: drawnCard.getComponent(Card)._cardId }
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
    cardHolderId?: number
  ) {
    cc.log('declare attack start!')
    if (sendToServer) {
      TurnsManager.currentTurn.attackPlays -= 1;
      let monsterField = cc
        .find("Canvas/MonsterField")
        .getComponent(MonsterField);
      let monsterId;
      let monsterDeck = CardManager.monsterDeck.getComponent(Deck);
      let monsterCardHolder: MonsterCardHolder;
      let attackedMonster;
      let newMonster = monsterCard;
      let declareAttack = new DeclareAttack(this.character.getComponent(Card)._cardId, this, monsterCard)
      await Stack.addToStack(declareAttack, true)

      //occurs when selected card is top card of monster deck, will let player choose where to put the new monster
      if (monsterCard == monsterDeck.topBlankCard) {
        cc.log(`chosen card is top deck ${monsterCard.name}`)
        let chooseCard = new ChooseCard();
        newMonster = monsterDeck.drawCard(sendToServer);
        CardPreviewManager.getPreviews(Array.of(newMonster), true)
        CardPreviewManager.showToOtherPlayers(newMonster);
        chooseCard.chooseType = CHOOSE_CARD_TYPE.MONSTER_PLACES
        let monsterInSpotChosen = await chooseCard.collectData({ cardPlayerId: this.playerId })
        let activeMonsterSelected = monsterInSpotChosen.effectTargetCard.getComponent(Monster)
        cc.log(activeMonsterSelected.name)
        monsterCardHolder = MonsterField.getMonsterPlaceById(
          activeMonsterSelected.monsterPlace.id
        );
        await MonsterField.addMonsterToExsistingPlace(monsterCardHolder.id, newMonster, true)
        monsterCard = newMonster;
      }
      //if the drawn card is a non-monster play its effect
      if (monsterCard.getComponent(Monster).isNonMonster) {
        await this.activateCard(monsterCard, true)
        //if the drawn card is a monster, declare attack
      } else {
        await BattleManager.declareAttackOnMonster(monsterCard);
      }
    } else {

    }
  }


  async giveYesNoChoice() {

    let skipBtn = cc.find('Canvas/SkipButton')
    let okBtn = cc.find('Canvas/ConfirmSelectButton')
    skipBtn.off(cc.Node.EventType.TOUCH_START)
    okBtn.off(cc.Node.EventType.TOUCH_START)
    okBtn.active = true;
    skipBtn.getComponentInChildren(cc.Label).string = 'No'
    okBtn.getComponentInChildren(cc.Label).string = 'Yes'
    skipBtn.on(cc.Node.EventType.TOUCH_START, () => {
      this._playerYesNoDecision = false;
      this._hasPlayerSelectedYesNo = true
    }, this)
    okBtn.on(cc.Node.EventType.TOUCH_START, () => {
      this._playerYesNoDecision = true;
      this._hasPlayerSelectedYesNo = true
    }, this)
    let choice = await this.waitForPlayerYesNoSelection()

    skipBtn.off(cc.Node.EventType.TOUCH_START)
    okBtn.off(cc.Node.EventType.TOUCH_START)
    skipBtn.getComponentInChildren(cc.Label).string = 'Skip'
    okBtn.getComponentInChildren(cc.Label).string = 'Ok'
    okBtn.active = false;
    return choice;
  }

  async waitForPlayerYesNoSelection(): Promise<boolean> {

    return new Promise((resolve, reject) => {
      let check = () => {
        if (this._hasPlayerSelectedYesNo) {
          this._hasPlayerSelectedYesNo = false;

          //  ActionManager.noMoreActionsBool = false;
          resolve(this._playerYesNoDecision);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });

  }

  calculateDamage() {
    let damage = 0;
    damage += this.baseDamage;
    damage += this.character.getComponent(Character).damage;
    // items that increase damage should increase baseDamage
    return damage;
  }

  async rollDice(rollType: ROLL_TYPE, numberRolled?: number) {
    let playerDice = this.dice;
    let newNumberRolled: number
    if (numberRolled == null) {
      ServerClient.$.send(Signal.ROLL_DICE, { playerId: this.playerId });
      numberRolled = await playerDice.rollDice(rollType);
      ServerClient.$.send(Signal.ROLL_DICE_ENDED, {
        playerId: this.playerId,
        numberRolled: numberRolled
      });

    }
    newNumberRolled = numberRolled;
    return newNumberRolled
  }

  async rollAttackDice(sendToServer: boolean, numberRolled?: number) {
    let playerId = this.playerId;
    this.dice.getComponentInChildren(RollDice).rollType = ROLL_TYPE.ATTACK;
    if (sendToServer) {
      let attackRoll = new AttackRoll(this.character.getComponent(Card)._cardId, this.node, BattleManager.currentlyAttackedMonster.node)
      await Stack.addToStack(attackRoll, true)
    }

  }

  async loseLoot(loot: cc.Node, sendToServer: boolean) {
    this.hand.removeCardFromLayout(loot)
    this.handCards.splice(this.handCards.indexOf(loot), 1)
    let serverData = {
      signal: Signal.PLAYER_LOSE_LOOT,
      srvData: { playerId: this.playerId, cardId: loot.getComponent(Card)._cardId }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
  }


  async gainLoot(loot: cc.Node, sendToServer: boolean) {
    this.hand.addCardToLayout(loot)
    loot.getComponent(Card)._ownedBy = this;
    if (loot.getComponent(Card)._isFlipped) {
      if (this.playerId == PlayerManager.mePlayer.getComponent(Player).playerId) {
        loot.getComponent(Card).flipCard(sendToServer)
      }
    } else {
      if (this.playerId != PlayerManager.mePlayer.getComponent(Player).playerId) {
        loot.getComponent(Card).flipCard(sendToServer)
      }
    }
    let serverData = {
      signal: Signal.PLAYER_GET_LOOT,
      srvData: { playerId: this.playerId, cardId: loot.getComponent(Card)._cardId }
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
    let playerId = this.playerId;
    // let discardAction = new MoveLootToPile(
    //   { lootCard: lootCard },
    //   this.playerId
    // );
    if (sendToServer) {
      //  await CardManager.moveCardTo(lootCard, PileManager.lootCardPileNode, sendToServer)
      await PileManager.addCardToPile(CARD_TYPE.LOOT, lootCard, sendToServer)
    }
    let cardId = lootCard.getComponent(Card)._cardId;
    let serverData = {
      signal: Signal.DISCARD_LOOT,
      srvData: { playerId: playerId, cardId: cardId }
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
      let purchaseItem = new PurchaseItem(this.character.getComponent(Card)._cardId, itemToBuy, this.playerId)

      await Stack.addToStack(purchaseItem, sendToServer)
    }
  }

  async addItem(itemToAdd: cc.Node, sendToServer: boolean, isReward: boolean) {

    let chainNum
    let itemCardComp: Card = itemToAdd.getComponent(Card);
    let treasureDeck = CardManager.treasureDeck;
    //if selected card to buy is top deck of treasure buy him!

    if (itemToAdd == treasureDeck.getComponent(Deck).topBlankCard) {
      itemToAdd = treasureDeck.getComponent(Deck).drawCard(sendToServer);
      itemCardComp = itemToAdd.getComponent(Card);
    }
    let playerDeskComp = this.desk;
    let playerId = this.playerId;
    let cardId = itemCardComp._cardId;
    let cardItemComp = itemToAdd.getComponent(Item);
    switch (cardItemComp.type) {
      case ITEM_TYPE.ACTIVE:
        this.activeItems.push(itemToAdd);
        break;
      case ITEM_TYPE.PASSIVE:
        this.passiveItems.push(itemToAdd);
        //      PassiveManager.registerPassiveItem(card);
        break;
      case ITEM_TYPE.BOTH:
        this.activeItems.push(itemToAdd);
        this.passiveItems.push(itemToAdd);
        // PassiveManager.registerPassiveItem(card);
        break;
      default:
        break;
    }
    this.cards.push(itemToAdd);
    let serverData = {
      signal: Signal.ADD_AN_ITEM,
      srvData: { playerId, cardId, isReward }
    };
    if (sendToServer) {

      await CardManager.moveCardTo(itemCardComp.node, this.desk.node, sendToServer, true)
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    await this.desk.addToDesk(itemToAdd.getComponent(Card))
    return true
  }

  async playLootCard(lootCard: cc.Node, sendToServer: boolean) {
    let playerId = this.playerId;
    let cardId = lootCard.getComponent(Card)._cardId;
    let serverData = {
      signal: Signal.PLAY_LOOT_CARD,
      srvData: { playerId: playerId, cardId: cardId }
    };
    //    let action = new MoveLootToPile({ lootCard: lootCard }, playerId);
    if (sendToServer) {
      let hasLockingEffect;
      let collector = lootCard.getComponent(CardEffect).multiEffectCollector;
      if (collector != null && collector instanceof MultiEffectRoll) {
        hasLockingEffect = true;
      } else hasLockingEffect = false;
      if (this.playerId == TurnsManager.currentTurn.PlayerId && TurnsManager.currentTurn.lootCardPlays > 0) {
        TurnsManager.currentTurn.lootCardPlays -= 1
      }
      let playLoot = new PlayLootCardStackEffect(this.character.getComponent(Card)._cardId, hasLockingEffect, lootCard, this.character, false, false)
      await Stack.addToStack(playLoot, sendToServer)

    } else {
      if (lootCard.getComponent(Card)._isFlipped) {
        lootCard.getComponent(Card).flipCard(sendToServer);
      }
    }
  }


  async killPlayer(sendToServer: boolean, addBelow?: boolean, stackEffectToAddBelowTo?: StackEffectInterface) {

    if (sendToServer) {
      let playerDeath = new PlayerDeath(this.character.getComponent(Card)._cardId, this.character)
      // if (addBelow) {
      await Stack.addToStackBelow(playerDeath, stackEffectToAddBelowTo)

    }

  }
  async removeCurse(curseCard: cc.Node, sendToServer: boolean) {
    if (sendToServer) {
      await this.destroyItem(curseCard, sendToServer)
    }
  }

  async payPenalties(sendToServer: boolean) {

    if (this.coins > 0) {
      this.coins -= 1;
    }
    if (this.handCards.length > 0) {
      let chooseCard = new ChooseCard();
      let cardToChooseFrom = chooseCard.getCardsToChoose(
        CHOOSE_CARD_TYPE.MY_HAND,
        this
      );
      let chosenData = await chooseCard.requireChoosingACard(cardToChooseFrom);
      let chosenCard = CardManager.getCardById(chosenData.cardChosenId);
      let over = this.discardLoot(chosenCard, sendToServer);
    }
    let nonEternalItems = this.deskCards.filter(
      card => !card.getComponent(Item).eternal
    );
    if (nonEternalItems.length > 0) {
      let chooseCard = new ChooseCard();
      let cardToChooseFrom = chooseCard.getCardsToChoose(
        CHOOSE_CARD_TYPE.PLAYER_NON_ETERNALS,
        this
      );
      let chosenData = await chooseCard.requireChoosingACard(cardToChooseFrom);

      let chosenCard = CardManager.getCardById(chosenData.cardChosenId);

      let over = this.destroyItem(chosenCard, sendToServer);
    }
    return true
  }

  destroyItem(itemToDestroy: cc.Node, sendToServer: boolean) {

    PileManager.addCardToPile(CARD_TYPE.TREASURE, itemToDestroy, sendToServer);
  }

  async startTurn(numOfCardToDraw: number, numberOfItemsToCharge: number, sendToServer: boolean) {


    if (sendToServer) {

      //recharge items
      if (numberOfItemsToCharge == this.activeItems.length) {
        for (const item of this.activeItems) {
          if (item.getComponent(Item).activated) {
            await this.rechargeItem(item, sendToServer)
          }
        }
      } else {
        for (let i = 0; i < numberOfItemsToCharge; i++) {
          let chooseCard = new ChooseCard();
          let cardChosenData = await chooseCard.requireChoosingACard(this.activeItems)
          let item = CardManager.getCardById(cardChosenData.cardChosenId, true).getComponent(Item)
          if (item.activated) {
            await this.rechargeItem(item.node, sendToServer)
          }
        }
      }

      //add passive check for "Start of turn" Effects.

      await this.givePriority(true)
      //put loot 1 on the stack for the player
      cc.log(numOfCardToDraw)
      for (let i = 0; i < numOfCardToDraw; i++) {
        let turnDraw = new StartTurnLoot(this.character.getComponent(Card)._cardId, this.character)

        await Stack.addToStack(turnDraw, true)
        //await this.drawCard(CardManager.lootDeck, sendToServer)
      }
    }

  }

  async heal(hpToHeal: number, sendToServer: boolean) {

    if (sendToServer) {
      ServerClient.$.send(Signal.PLAYER_HEAL, { playerId: this.playerId, hpToHeal: hpToHeal })
    }
    if (this._Hp + hpToHeal > this.character.getComponent(Character).Hp + this._hpBonus) {
      this._Hp = this.character.getComponent(Character).Hp + this._hpBonus
    } else {
      this._Hp += hpToHeal
    }
    this.hpLable.string = `${this._Hp}♥`
  }

  async endTurn(sendToServer: boolean) {

    // end of turn passive effects should trigger
    if (sendToServer) {
      await this.givePriority(true)
      //effect that last to end of turn wear off.
      PassiveManager.oneTurnAfterEffects = [];
      PassiveManager.oneTurnBeforeEffects = [];
      ServerClient.$.send(Signal.NEXT_TURN)
      //for each player heal to max hp
      for (let playerNode of PlayerManager.players) {
        let player = playerNode.getComponent(Player);
        player.heal(player.character.getComponent(Character).Hp + player._hpBonus, sendToServer)
      }
      //for each monster heal to max hp
      for (const monsterNode of MonsterField.activeMonsters) {
        let monster = monsterNode.getComponent(Monster);
        monster.heal(monster.HP, sendToServer)
      }
    }
    TurnsManager.nextTurn();

    /// add a check if you have more than 10 cards discard to 10.
    return true
  }




  async checkIfDead() {
    if (this._Hp <= 0) {
      if (PlayerManager.mePlayer == this.node) {
        await this.killPlayer(true);
        return true;
      }
    } else {
      return false;
    }
  }




  async getHit(damage: number, sendToServer: boolean) {
    let passiveMeta = new PassiveMeta('getHit', Array.of(damage), null, this.node)
    let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
    passiveMeta.args = afterPassiveMeta.args;
    if (afterPassiveMeta.continue) {

      if (this._Hp - damage < 0) {
        this._Hp = 0
      } else {
        this._Hp -= damage
      }
      this.hpLable.string = `${this._Hp}♥`
      let serverData = {
        signal: Signal.PLAYER_GET_HIT,
        srvData: { playerId: this.playerId, damage: damage }
      };
      if (sendToServer) {
        ServerClient.$.send(serverData.signal, serverData.srvData)
      }
    }
    // let isDead = await this.checkIfDead();


    //  passiveMeta.result = isDead;
    let thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
    //return the original or changed result!;
    return thisResult;

  }

  async gainHp(hpToGain: number, sendToServer: boolean) {
    this._hpBonus += hpToGain;
    let serverData = {
      signal: Signal.PLAYER_GAIN_HP,
      srvData: { playerId: this.playerId, hpToGain: hpToGain }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  async gainDMG(DMGToGain: number, sendToServer: boolean) {
    this.baseDamage += DMGToGain;
    let serverData = {
      signal: Signal.PLAYER_GAIN_DMG,
      srvData: { playerId: this.playerId, DMGToGain: DMGToGain }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  async gainRollBonus(bonusToGain: number, sendToServer: boolean) {
    this.nonAttackRollBonus += bonusToGain;
    let serverData = {
      signal: Signal.PLAYER_GAIN_ROLL_BONUS,
      srvData: { playerId: this.playerId, bonusToGain: bonusToGain }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }


  async gainAttackRollBonus(bonusToGain: number, sendToServer: boolean) {
    this.attackRollBonus += bonusToGain;
    let serverData = {
      signal: Signal.PLAYER_GAIN_ATTACK_ROLL_BONUS,
      srvData: { playerId: this.playerId, bonusToGain: bonusToGain }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  async gainFirstAttackRollBonus(bonusToGain: number, sendToServer: boolean) {
    this.firstAttackRollBonus += bonusToGain;
    let serverData = {
      signal: Signal.PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS,
      srvData: { playerId: this.playerId, bonusToGain: bonusToGain }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }


  async rechargeItem(itemCard: cc.Node, sendToServer: boolean) {
    let item = itemCard.getComponent(Item);
    await item.rechargeItem(sendToServer);
    let serverData = {
      signal: Signal.PLAYER_RECHARGE_ITEM,
      srvData: { playerId: this.playerId, cardId: itemCard.getComponent(Card)._cardId }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  async getMonsterRewards(monsterKilled: cc.Node, sendToServer: boolean) {
    let monster = monsterKilled.getComponent(Monster);
    let monsterReward = monster.reward;

    let over = await monsterReward.rewardPlayer(this.node, sendToServer);
    return new Promise((resolve, reject) => resolve(true))
  }

  async activateCard(card: cc.Node, isStackEmpty: boolean) {
    //this.activatedCard = card;
    //this.cardActivated = true;
    let cardId = card.getComponent(Card)._cardId;
    let hasLockingEffect;
    let collector = card.getComponent(CardEffect).multiEffectCollector;
    if (collector != null && collector instanceof MultiEffectRoll) {
      hasLockingEffect = true;
    } else hasLockingEffect = false;
    let activateItem = new ActivateItem(this.character.getComponent(Card)._cardId, hasLockingEffect, card, this.character, false)
    if (isStackEmpty) {
      await Stack.addToStack(activateItem, true)
    } else {
      ServerClient.$.send(Signal.RESPOND_TO, { playerId: this._askingPlayerId, stackEffectResponse: true })
      this._askingPlayerId = 0;
      await Stack.addToStack(activateItem, true)
    }

  }

  async getSoulCard(cardWithSoul: cc.Node, sendToServer: boolean) {
    let over = await CardManager.moveCardToSoulsSpot(cardWithSoul, this.soulsLayout, sendToServer)
    this.souls += cardWithSoul.getComponent(Card).souls;
    let id = this.playerId;

    let serverData = {
      signal: Signal.GET_SOUL,
      srvData: { playerId: id, cardId: cardWithSoul.getComponent(Card)._cardId }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
      if (this.souls >= 4) {
        cc.find('MainScript').emit('gameOver', this.playerId)
      }
      if (cardWithSoul.getComponent(Monster).monsterPlace != null) {
        cardWithSoul.getComponent(Monster).monsterPlace.removeMonster(cardWithSoul, sendToServer);
        cardWithSoul.getComponent(Monster).monsterPlace.getNextMonster(sendToServer);
      };
    }

  }

  async givePriority(sendToServer: boolean) {
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


  //Example for passives, any interaction for passives needs to be like this!
  async changeMoney(numOfCoins: number, sendToServer: boolean) {
    //do passive effects b4
    let passiveMeta = new PassiveMeta('changeMoney', Array.of(numOfCoins), null, this.node)
    let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
    passiveMeta.args = afterPassiveMeta.args;
    //if continue do regular function
    if (afterPassiveMeta.continue) {
      //regular function
      numOfCoins = afterPassiveMeta.args[0];
      this.coins += numOfCoins;
      if (sendToServer) {
        ServerClient.$.send(Signal.CHANGE_MONEY, { playerId: this.playerId, numOfCoins: numOfCoins })
      }
    }
    //set the retun value of the original function as the result
    passiveMeta.result = null
    //do passive effects after!
    let thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
    //return the original or changed result!;
    return thisResult;

  }

  //for passives so dont trigger passiveCheck
  setMoney(numOfCoins: number, sendToServer: boolean) {
    this.coins = numOfCoins;
    if (sendToServer) {

      ServerClient.$.send(Signal.SET_MONEY, { playerId: this.playerId, numOfCoins: numOfCoins })
    }
  }

  setDesk(desk: cc.Node) {
    // this.node.addChild(desk);
    this.landingZones.push(desk);
    this.desk = desk.getComponent(PlayerDesk);
    this.desk._playerId = this.playerId
    this.desk.name = 'Desk ' + this.playerId
  }

  setHand(hand: cc.Node) {
    // this.node.addChild(hand);
    let handWidget: cc.Widget = hand.getComponent(cc.Widget);
    handWidget.updateAlignment();
    hand.getComponent(
      CardLayout
    ).boundingBoxWithoutChildren = hand.getBoundingBoxToWorld();

    this.hand = hand.getComponent(CardLayout);
    this.hand.playerId = this.playerId;
  }

  calculateReactions() {
    this.reactCardNode = [];

    for (let i = 0; i < this.activeItems.length; i++) {
      const activeItem = this.activeItems[i].getComponent(Item);
      let cardEffectComp = activeItem.node.getComponent(CardEffect);
      if (!activeItem.activated && cardEffectComp.testEffectsPreConditions()) {
        this.reactCardNode.push(activeItem.node);
      }
    }
    if (TurnsManager.currentTurn.PlayerId == this.playerId && TurnsManager.currentTurn.lootCardPlays > 0) {
      for (const handCard of this.handCards) {
        this.reactCardNode.push(handCard)
      }
    }

  }

  showAvailableReactions() {
    for (let i = 0; i < this.reactCardNode.length; i++) {
      const card = this.reactCardNode[i];
      let s = cc.sequence(
        cc.fadeTo(0.5, 255 / 2),
        cc.fadeTo(0.5, 255),
        cc.fadeTo(0.5, 255 / 2),
        cc.fadeTo(0.5, 255)
      );
      s.setTag(12);
      card.runAction(s.repeatForever());
    }
  }

  hideAvailableReactions() {
    for (let i = 0; i < this.reactCardNode.length; i++) {
      const card = this.reactCardNode[i];
      card.stopActionByTag(12)
      // if (card.getActionByTag(12) != null) {
      //   card.stopAllActions();
      // } else card.stopActionByTag(12);
      card.runAction(cc.fadeTo(0.5, 255));
    }
  }

  async respondWithNoAction(reactionNodes: cc.Node[], askingPlayerId: number) {


    this.hideAvailableReactions()
    cc.find('Canvas/SkipButton').off(cc.Node.EventType.TOUCH_START)

    ServerClient.$.send(Signal.RESPOND_TO, { playerId: askingPlayerId, stackEffectResponse: false })
  }

  async getResponse(askingPlayerId: number) {

    this._askingPlayerId = askingPlayerId
    this.calculateReactions();

    if (this.reactCardNode.length == 0 || !this._reactionToggle.isChecked) {
      //nothing to respond with or switch is off
      this.respondWithNoAction(
        this.reactCardNode,
        askingPlayerId
      );
    } else {

      let blockReactions = this.respondWithNoAction.bind(this)
      this.timeToRespondTimeOut
      //if time is out send a no reaction taken message
      let timeOut = setTimeout(
        blockReactions,
        TIME_TO_REACT_ON_ACTION * 1000,
        this.reactCardNode,
        askingPlayerId,
      );
      //make skip btn skip and respond to the asking player that you didnt do anything
      cc.find('Canvas/SkipButton').on(cc.Node.EventType.TOUCH_START, () => {
        clearTimeout(timeOut);
        cc.log(`skip btn was pressed`)
        this.respondWithNoAction(
          this.reactCardNode,
          askingPlayerId
        )
      }, this)
      this.showAvailableReactions();

      for (let i = 0; i < this.reactCardNode.length; i++) {
        const card = this.reactCardNode[i];
        CardManager.disableCardActions(card);
        CardManager.makeCardReactable(card, this.node);
      }
      let activatedCard = await this.waitForCardActivation();
      this.activatedCard = null
      if (activatedCard != null) {
        cc.log(`player has respponded with ${activatedCard.name}`)
        clearTimeout(timeOut);
        cc.find('Canvas/SkipButton').off(cc.Node.EventType.TOUCH_START)
        this.hideAvailableReactions();
        //ServerClient.$.send(Signal.RESOLVEACTIONS, data2);


      }
    }
  }




  async waitForCardActivation(): Promise<cc.Node> {
    return new Promise((resolve, reject) => {
      let check = () => {
        if (this.cardActivated == true) {
          this.cardActivated = false;
          resolve(this.activatedCard);
        } else if (this.cardNotActivated == true) {
          this.cardNotActivated = false;
          resolve(null);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  //currently return boolean , later change to return a promise with the card effect.
  // async chooseCardToActivate(card: cc.Node): Promise<ServerEffect> {
  //   let serverCardEffect = await CardManager.activateCard(card, this.playerId);



  //   return new Promise((resolve, reject) => {
  //     resolve(serverCardEffect);
  //   });
  // }

  setDice(dice: cc.Node) {
    // this.node.addChild(dice);
    this.dice = dice.getComponent(Dice);
    this.dice.player = this;
  }



  setCharacter(character: cc.Node, characterItem: cc.Node) {
    let characterLayout = this.desk.node.getChildByName('CharacterLayout');
    this.soulsLayout = characterLayout;
    let characterLayoutWidget = characterLayout.getComponent(cc.Widget)
    character.setParent(this.desk.node);
    characterItem.setParent(this.desk.node);
    let charWidget = character.addComponent(cc.Widget);
    let charItemWidget = characterItem.addComponent(cc.Widget);
    // charWidget.target = character.parent;
    charWidget.target = this.desk.node;
    charItemWidget.target = characterItem.parent;
    characterLayoutWidget.target = characterItem.parent;
    // charWidget.isAlignRight = true;
    // charItemWidget.isAlignRight = true;
    // characterLayoutWidget.isAlignRight = true;
    let meId: number = PlayerManager.mePlayer.getComponent(Player).playerId;


    if (this._putCharLeft) {
      charWidget.isAlignRight = true;
      charItemWidget.isAlignRight = true;
      characterLayoutWidget.isAlignRight = true;
      charWidget.right = 700 + CARD_WIDTH * (1 / 3);
      charItemWidget.right = 700 + CARD_WIDTH * (1 / 3);
      characterLayoutWidget.right = 700 + CARD_WIDTH * (1 / 3);
    } else {
      charWidget.isAlignLeft = true;
      charItemWidget.isAlignLeft = true;
      characterLayoutWidget.isAlignLeft = true;
      charWidget.left = 700 + CARD_WIDTH * (1 / 3);
      charItemWidget.left = 700 + CARD_WIDTH * (1 / 3);
      characterLayoutWidget.left = 700 + CARD_WIDTH * (1 / 3);
    }

    charWidget.isAlignTop = true;
    charItemWidget.isAlignBottom = true;
    characterLayoutWidget.isAlignTop = true;
    // charWidget.top = -75;
    charWidget.top = 0;
    characterLayoutWidget.top = 0 + 15;
    charItemWidget.bottom = 5;
    this._Hp = character.getComponent(Character).Hp;
    this.damage = character.getComponent(Character).damage;
    this.character = character;
    this.characterItem = characterItem;
    this.cards.push(character, characterItem);
  }

  @property([cc.Node])
  addTohandButtons: cc.Node[] = [];

  @property([cc.Node])
  landingZones: cc.Node[] = [];

  @property
  me: boolean = false;

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
