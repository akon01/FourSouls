import { CardLayout } from "../CardLayout";
import Dice from "./Dice";
import PlayerDesk from "../PlayerDesk";
import Deck from "./Deck";
import {
  DrawCardAction,
  DeclareAttackAction,
  MoveLootToPile,
  AddItemAction,
  ActivateItemAction,
  RollDiceAction,
  AttackMonster,
  EndTurnAction
} from "../Action";
import Signal from "../../../Misc/Signal";
import {
  CARD_TYPE,
  TIMETOREACTONACTION,
  ITEM_TYPE,
  CARD_WIDTH,
  ROLL_TYPE,
  printMethodStarted,
  COLORS,
  checkIfPlayerIsDead,
  CHOOSE_TYPE
} from "../../Constants";
import ActionManager from "../../Managers/ActionManager";
import MonsterField from "../MonsterField";
import CardManager from "../../Managers/CardManager";
import ChooseCard from "../../CardEffectComponents/DataCollector/ChooseCard";
import Monster from "../CardTypes/Monster";
import Card from "./Card";
import Item from "../CardTypes/Item";
import Character from "../CardTypes/Character";
import { ServerEffect } from "../ServerCardEffect";
import MonsterCardHolder from "../MonsterCardHolder";
import CardPreview from "../CardPreview";
import RollDice from "../../CardEffectComponents/RollDice";
import {
  testForPassiveBefore,
  testForPassiveAfter,
  activatePassiveB4
} from "../../Managers/PassiveManager";
import TurnsManager from "../../Managers/TurnsManager";
import Server from "../../../ServerClient/ServerClient";
import PlayerManager from "../../Managers/PlayerManager";
import { rejects } from "assert";
import { afterMethod, beforeMethod } from "kaop-ts";
import PileManager from "../../Managers/PileManager";

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
  Hp: number = 0;

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
  cards: cc.Node[] = [];

  @property
  cardActivated: boolean = false;

  @property
  cardNotActivated: boolean = false;

  @property
  activatedCard: cc.Node = null;

  @property
  timeToRespondTimeOut = null;

  async drawCard(deck: cc.Node, sendToServer: boolean, alreadyDrawnCard?: cc.Node) {
    let drawnCard: cc.Node
    if (alreadyDrawnCard != null) {

      drawnCard = alreadyDrawnCard
    } else {
      drawnCard = deck.getComponent(Deck).drawCard(sendToServer);
    }

    let drawAction = new DrawCardAction({ drawnCard }, this.playerId);
    let serverData;
    let cardId = drawnCard.getComponent(Card)._cardId
    serverData = {
      signal: Signal.CARDDRAWED,
      srvData: { playerId: this.playerId, deckType: CARD_TYPE.LOOT, drawnCardId: cardId }
    };

    let bool = await ActionManager.showSingleAction(
      drawAction,
      serverData,
      sendToServer
    );
  }

  async declareAttack(
    monsterCard: cc.Node,
    sendToServer: boolean,
    cardHolderId?: number
  ) {
    if (TurnsManager.currentTurn.attackPlays > 0) {
      if (sendToServer) {
        let monsterField = cc
          .find("Canvas/MonsterDeck/MonsterField")
          .getComponent(MonsterField);
        let monsterId;
        let monsterDeck = CardManager.monsterDeck.getComponent(Deck);
        let monsterCardHolder: MonsterCardHolder;
        let attackedMonster;
        let newMonster = monsterCard;
        //occurs when selected card is top card of monster deck, will let player choose where to put the new monster
        if (monsterCard == monsterDeck.topBlankCard) {
          let chooseCard = new ChooseCard();
          newMonster = monsterDeck.drawCard(sendToServer);
          CardPreview.$.showCardPreview(newMonster, false, false, false);

          CardPreview.$.showToOtherPlayers(newMonster);
          let monsterInSpotChosen = await chooseCard.collectDataOfPlaces({
            cardPlayerId: this.playerId,
            deckType: CARD_TYPE.MONSTER
          });

          let activeMonsterSelected = CardManager.getCardById(
            monsterInSpotChosen.cardChosenId, true
          ).getComponent(Monster);
          ;
          ;
          monsterCardHolder = MonsterField.getMonsterPlaceById(
            activeMonsterSelected.monsterPlace.id
          );
        } else {
          monsterCardHolder = MonsterField.getMonsterPlaceById(
            monsterCard.getComponent(Monster).monsterPlace.id
          );
        }

        let action = new DeclareAttackAction({
          attackedMonster: newMonster,
          playerId: this.playerId,
          isFromServer: false,
          cardHolderId: monsterCardHolder.id
        });
        let serverData = {
          signal: Signal.DECLAREATTACK,
          srvData: {
            attackedMonsterId: newMonster.getComponent(Card)._cardId,
            playerId: this.playerId,
            cardHolderId: monsterCardHolder.id
          }
        };
        let bool = await ActionManager.doAction(action, serverData);
      } else {

        let action = new DeclareAttackAction({
          attackedMonster: monsterCard,
          playerId: this.playerId,
          isFromServer: true,
          cardHolderId: cardHolderId
        });
        let serverData = {
          signal: Signal.DECLAREATTACK,
          srvData: {
            attackedMonsterId: monsterCard.getComponent(Card)._cardId,
            playerId: this.playerId
          }
        };
        let bool = await ActionManager.showSingleAction(
          action,
          serverData,
          sendToServer
        );
      }
    }
  }

  calculateDamage() {
    let damage = 0;
    damage += this.baseDamage;
    damage += this.character.getComponent(Character).damage;
    // items that increase damage should increase baseDamage
    return damage;
  }

  async rollDice(rollType: ROLL_TYPE, numberRolled?: number) {
    let playerDice = this.node.getComponentInChildren(Dice);
    // this.dice.getComponentInChildren(RollDice).rollType = rollType;
    // Server.$.send(Signal.ROLLDICE, { playerId: this.playerId });
    // numberRolled = await playerDice.rollDice(rollType); 
    // Server.$.send(Signal.ROLLDICEENDED, {
    //   playerId: this.playerId,
    //   numberRolled: numberRolled
    // });
    let newNumberRolled
    if (numberRolled == null) {
      // let action = new RollDiceAction({ rollType: rollType, sendToServer: false }, this.playerId, this.dice.node)
      // newNumberRolled = await ActionManager.doAction(action, {})

      Server.$.send(Signal.ROLLDICE, { playerId: this.playerId });
      numberRolled = await playerDice.rollDice(rollType);
      Server.$.send(Signal.ROLLDICEENDED, {
        playerId: this.playerId,
        numberRolled: numberRolled
      });

      // } else {
      // let action = new RollDiceAction({ rollType: rollType, sendToServer: false }, this.playerId, this.dice.node, numberRolled)
      // let over = await ActionManager.showSingleAction(action, {}, false);
    }
    newNumberRolled = numberRolled;
    return new Promise((resolve, reject) => {
      resolve(newNumberRolled);
    });
  }

  async rollAttackDice(sendToServer: boolean, numberRolled?: number) {
    let playerId = this.playerId;
    this.dice.getComponentInChildren(RollDice).rollType = ROLL_TYPE.ATTACK;

    let action = new AttackMonster(
      { rollType: ROLL_TYPE.ATTACK, sendToServer: sendToServer },
      playerId,
      this.dice.node
    );
    let serverData = null;
    //  {
    //   signal: Signal.ROLLDICE,
    //   srvData: { playerId: this.playerId }
    // };
    if (sendToServer) {
      let bool = await ActionManager.doAction(action, serverData);
    } else {
      let bool = await ActionManager.showSingleAction(
        action,
        serverData,
        false
      );
    }
  }


  async discardLoot(lootCard: cc.Node, sendToServer: boolean) {
    let playerId = this.playerId;
    let discardAction = new MoveLootToPile(
      { lootCard: lootCard },
      this.playerId
    );
    let cardId = lootCard.getComponent(Card)._cardId;
    let serverData = {
      signal: Signal.DISCRADLOOT,
      srvData: { playerId: playerId, cardId: cardId }
    };
    let bool = await ActionManager.showSingleAction(
      discardAction,
      serverData,
      sendToServer
    );
  }

  buyItem(itemToBuy: cc.Node, sendToServer: boolean) {
    // if (TurnsManager.currentTurn.PlayerId == this.playerId) {

    //   TurnsManager.currentTurn.buyPlays -= 1;
    // }

    if (TurnsManager.currentTurn.buyPlays > 0) {

      TurnsManager.currentTurn.buyPlays -= 1;
      this.addItem(itemToBuy, sendToServer, false);
    }
  }

  async addItem(itemToAdd: cc.Node, sendToServer: boolean, isReward: boolean) {

    let chainNum
    let itemCardComp: Card = itemToAdd.getComponent(Card);
    let treasureDeck = CardManager.treasureDeck;
    //if selected card to buy is top deck of treasure buy him!

    if (itemCardComp.topDeckof == treasureDeck) {

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
      signal: Signal.ADDANITEM,
      srvData: { playerId, cardId, isReward }
    };
    let action = new AddItemAction({
      movedCard: itemToAdd,
      playerDeskComp: playerDeskComp
    });
    if (isReward) {

      chainNum = await ActionManager.showSingleAction(action, serverData, sendToServer);

    } else {
      if (sendToServer) {
        chainNum = await ActionManager.doAction(action, serverData);
      } else if (!isReward) {
        chainNum = await ActionManager.showSingleAction(action, serverData, sendToServer);
      }
    }




    let chainOver = await this.waitForActionChain(chainNum)


    return new Promise((resolve, reject) => {
      resolve(true)
    })
  }

  async playLootCard(lootCard: cc.Node, sendToServer: boolean) {
    let playerId = this.playerId;
    let cardId = lootCard.getComponent(Card)._cardId;
    let serverData = {
      signal: Signal.PLAYLOOTCARD,
      srvData: { playerId: playerId, cardId: cardId }
    };
    let action = new MoveLootToPile({ lootCard: lootCard }, playerId);
    if (sendToServer) {
      let bool = await ActionManager.doAction(action, serverData);
    } else {
      if (lootCard.getComponent(Card).isFlipped) {
        lootCard.getComponent(Card).flipCard();
      } else {
      }
      let bool = await ActionManager.showSingleAction(
        action,
        serverData,
        sendToServer
      );
    }
  }

  //@printMethodStarted(COLORS.RED)
  async activateItem(item: cc.Node, sendToServer: boolean) {
    let chainNum;
    let playerId = this.playerId;
    if (item != null) {
      let cardId = item.getComponent(Card)._cardId;
      let serverData = {
        signal: Signal.ACTIVATEITEM,
        srvData: { playerId: playerId, cardId: cardId }
      };
      let action = new ActivateItemAction({ activatedCard: item }, playerId);
      if (sendToServer) {
        chainNum = await ActionManager.doAction(action, serverData);
      } else {
        chainNum = await ActionManager.showSingleAction(
          action,
          serverData,
          sendToServer
        );
      }
      let isChainOver = this.waitForActionChain(chainNum);
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    } else {
      throw "received item is null";
    }
  }

  async killPlayer(sendToServer: boolean) {
    if (sendToServer) {
      let penaltiesPaied = await this.payPenalties(sendToServer);
    }
    if (ActionManager.inReactionPhase) {
      let effectStack = ActionManager.serverEffectStack;
      let newStack: ServerEffect[] = [];
      for (const effect of effectStack) {
        if (effect.cardPlayerId != this.playerId) {
          newStack.push(effect);
        }
      }
      ActionManager.serverEffectStack = newStack;
    }
    this.endTurn(sendToServer);
  }

  @testForPassiveBefore('payPenalties')
  @activatePassiveB4
  async payPenalties(sendToServer: boolean) {

    if (this.coins > 0) {
      this.coins -= 1;
    }
    if (this.handCards.length > 0) {
      let chooseCard = new ChooseCard();
      let cardToChooseFrom = chooseCard.getCardsToChoose(
        CHOOSE_TYPE.PLAYERHAND,
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
        CHOOSE_TYPE.PLAYERNONETERNALS,
        this
      );
      let chosenData = await chooseCard.requireChoosingACard(cardToChooseFrom);

      let chosenCard = CardManager.getCardById(chosenData.cardChosenId);

      let over = this.destroyItem(chosenCard, sendToServer);
    }
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  destroyItem(itemToDestroy: cc.Node, sendToServer: boolean) {

    PileManager.addCardToPile(CARD_TYPE.TREASURE, itemToDestroy, sendToServer);
  }

  async startTurn(numOfCardToDraw: number, numberOfItemsToCharge: number, sendToServer: boolean) {

    for (let i = 0; i < numOfCardToDraw; i++) {
      await this.drawCard(CardManager.lootDeck, sendToServer)
    }
    if (numberOfItemsToCharge == this.activeItems.length) {
      for (const item of this.activeItems) {
        if (item.getComponent(Item).activated) {
          this.rechargeItem(item)
        }
      }
    } else {
      for (let i = 0; i < numberOfItemsToCharge; i++) {
        let chooseCard = new ChooseCard();
        let cardChosenData = await chooseCard.requireChoosingACard(this.activeItems)
        let item = CardManager.getCardById(cardChosenData.cardChosenId, true).getComponent(Item)
        if (item.activated) {
          this.rechargeItem(item.node)
        }
      }
    }

  }

  endTurn(sendToServer: boolean) {

    let action = new EndTurnAction({}, this.playerId);
    //   let data = TurnsManager.currentTurn.PlayerId;
    //   Server.$.send(Signal.NEXTTURN, data);
    let serverData = {
      signal: Signal.NEXTTURN
      //  srvData: { playerId: playerId, cardId: cardId }
    };
    /// add a check if you have more than 10 cards discard to 10.
    let over = ActionManager.showSingleAction(action, serverData, sendToServer);
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  async waitForActionChain(chainNumber: number): Promise<boolean> {
    //w8 for a server message with a while,after the message is recived (should be a stack of effects with booleans) resolve with stack of effects.
    return new Promise((resolve, reject) => {
      let check = () => {
        if (!ActionManager.isReactionChainActive(chainNumber)) {

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

  async activatePassive(
    passiveItem: cc.Node,
    sendToServer: boolean,
    passiveIndex?: number
  ) {
    let realPassiveIndex;
    if (passiveIndex) {
      realPassiveIndex = passiveIndex;
    } else {
      realPassiveIndex = 0;
    }
    let activated = await passiveItem
      .getComponent(Card)
      .activatePassive(
        this.character.getComponent(Card)._cardId,
        realPassiveIndex,
        sendToServer
      );
    return new Promise((resolve, reject) => {
      resolve(activated);
    });
  }

  async checkIfDead() {
    if (ActionManager.inReactionPhase) {
      let over = await ActionManager.waitForReqctionsOver();
    }
    if (this.Hp <= 0) {
      if (PlayerManager.mePlayer == this.node) {
        this.killPlayer(true);
      }
    } else {
      return false;
    }
  }



  @testForPassiveAfter("getHit")
  @checkIfPlayerIsDead
  getHit(damage: number) {

    this.Hp -= damage;

    return new Promise((resolve, reject) => {
      resolve(true);
    });
    //add a function in action manager to check if any player is dead.
  }

  rechargeItem(itemCard: cc.Node) {
    let item = itemCard.getComponent(Item);
    item.rechargeItem();
  }

  async getMonsterRewards(monsterKilled: cc.Node, sendToServer: boolean) {
    let monster = monsterKilled.getComponent(Monster);
    let monsterReward = monster.reward;

    let over = await monsterReward.rewardPlayer(this.node, sendToServer);
    return new Promise((resolve, reject) => resolve(true))
  }

  activateCard(card: cc.Node) {
    this.activatedCard = card;
    this.cardActivated = true;
    let cardId = card.getComponent(Card)._cardId;
    let serverData = {
      signal: Signal.ACTIVATEITEM,
      srvData: { playerId: this.playerId, cardId: cardId }
    };
    let action = new ActivateItemAction({ activatedCard: card }, this.playerId);
    action.showAction()
    action.serverBrodcast(serverData)
  }

  async getSoulCard(cardWithSoul: cc.Node, sendToServer: boolean) {
    let over = await CardManager.moveCardToSoulsSpot(cardWithSoul, this.soulsLayout, sendToServer)
    this.souls += cardWithSoul.getComponent(Card).souls;
    if (this.souls >= 4) {

    }
    let id = this.playerId;

    let serverData = {
      signal: Signal.GETSOUL,
      srvData: { playerId: id, cardId: cardWithSoul.getComponent(Card)._cardId }
    };
    if (sendToServer) {
      Server.$.send(serverData.signal, serverData.srvData)
      if (cardWithSoul.getComponent(Monster).monsterPlace != null) {
        cardWithSoul.getComponent(Monster).monsterPlace.removeMonster(cardWithSoul, sendToServer);
        cardWithSoul.getComponent(Monster).monsterPlace.getNextMonster(sendToServer);
      };
    }

  }

  @testForPassiveBefore('changeMoney')
  @activatePassiveB4
  @testForPassiveAfter('changeMoney')
  changeMoney(numOfCoins: number, sendToServer: boolean) {
    this.coins += numOfCoins;
    if (sendToServer) {

      Server.$.send(Signal.CHANGEMONEY, { playerId: this.playerId, numOfCoins: numOfCoins })
    }

  }

  //for passives so dont trigger passiveCheck
  setMoney(numOfCoins: number, sendToServer: boolean) {
    this.coins = numOfCoins;
    if (sendToServer) {

      Server.$.send(Signal.SETMONEY, { playerId: this.playerId, numOfCoins: numOfCoins })
    }
  }

  setDesk(desk: cc.Node) {
    this.node.addChild(desk);
    this.landingZones.push(desk);
    this.desk = desk.getComponent(PlayerDesk);
  }

  setHand(hand: cc.Node) {
    this.node.addChild(hand);
    let handWidget: cc.Widget = hand.getComponent(cc.Widget);
    handWidget.updateAlignment();
    hand.getComponent(
      CardLayout
    ).boundingBoxWithoutChildren = hand.getBoundingBoxToWorld();

    this.hand = hand.getComponent(CardLayout);
  }

  calculateReactions() {
    this.reactCardNode = [];

    for (let i = 0; i < this.activeItems.length; i++) {
      const activeItem = this.activeItems[i].getComponent(Item);
      if (!activeItem.activated) {
        this.reactCardNode.push(activeItem.node);
      }
    }
    if (!this.character.getComponent(Item).activated) {
      this.reactCardNode.push(this.character);
    }
    // if (!this.characterItem.getComponent(Item).activated) {
    //   this.reactCardNode.push(this.characterItem);
    // }
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
      if (card.getActionByTag(12) != null) {
        card.stopAllActions();
      } else card.stopActionByTag(12);
      card.runAction(cc.fadeTo(0.5, 255));
    }
  }

  blockAvailableReactionsTimeout(
    data: {
      originalPlayer: number;
      lastPlayerTakenAction: number;
      booleans: boolean[];
      serverCardEffects: ServerEffect[];
    },
    reactionNodes,
    playerId
  ) {

    this.cardNotActivated = true;
    for (let i = 0; i < reactionNodes.length; i++) {
      const card: cc.Node = reactionNodes[i];

      CardManager.disableCardActions(card);
      card.runAction(cc.fadeTo(0.5, 255));
      card.stopAllActions();
    }
    //change this player bool to true.
    let newBooleans: boolean[] = [];
    for (let i = 0; i < data.booleans.length; i++) {
      let boolean = data.booleans[i];

      if (i == playerId - 1) {
        boolean = true;
      }
      newBooleans.push(boolean);
    }
    let newData = {
      originalPlayer: data.originalPlayer,
      lastPlayerTakenAction: data.lastPlayerTakenAction,
      booleans: newBooleans,
      serverCardEffects: data.serverCardEffects
    };

    //  this.reactionData = newData;
    // if (newData.serverCardEffects.length > 0 && newData.serverCardEffects[newData.serverCardEffects.length - 1].effectName == 'roll' && newData.serverCardEffects[newData.serverCardEffects.length - 1].cardPlayerId == this.playerId) {

    //   if (ActionManager.checkForLastAction(newData, true, true)) {
    //   }
    //   else {
    //     ActionManager.sendGetReactionToNextPlayer(newData);
    //   }
    // } else

    if (ActionManager.checkForLastAction(newData, true)) {
    } else {

      ActionManager.sendGetReactionToNextPlayer(newData);
    }
  }

  async getReaction(data: {
    originalPlayer: number;
    lastPlayerTakenAction: number;
    booleans: boolean[];
    serverCardEffects: ServerEffect[];
  }) {

    this.calculateReactions();
    //if no actions are available, add toggle of actions
    if (this.reactCardNode.length == 0) {

      this.blockAvailableReactionsTimeout(
        data,
        this.reactCardNode,
        this.playerId
      );
    } else {
      let blockReactions = this.blockAvailableReactionsTimeout.bind(this);
      this.timeToRespondTimeOut = setTimeout(
        blockReactions,
        TIMETOREACTONACTION * 1000,
        data,
        this.reactCardNode,
        this.playerId
      );
      this.showAvailableReactions();

      for (let i = 0; i < this.reactCardNode.length; i++) {
        const card = this.reactCardNode[i];

        //card.getComponent(Card).disableMoveComps()

        CardManager.disableCardActions(card);
        CardManager.makeCardReactable(card, this.node);

      }

      //if time is out send a no reaction taken message
      let activatedCard = await this.waitForCardActivation();
      if (activatedCard != null) {

        clearTimeout(this.timeToRespondTimeOut);
        this.hideAvailableReactions();

        let newBooleans: boolean[] = [];
        for (let i = 0; i < data.booleans.length; i++) {
          newBooleans.push(false);
        }
        data.booleans = newBooleans;
        data.lastPlayerTakenAction = this.playerId;

        ActionManager.sendGetReactionToNextPlayer(data);
        let serverEffectStack: ServerEffect[] = await ActionManager.waitForAllEffects();

        let actionCardServerEffect = await CardManager.getCardEffect(
          activatedCard,
          this.playerId
        );
        data.serverCardEffects = serverEffectStack;
        data.serverCardEffects.push(actionCardServerEffect)
        data.booleans = newBooleans;

        ActionManager.sendGetReactionToNextPlayer(data);
        serverEffectStack = await ActionManager.waitForAllEffects();
        let data2 = { originalPlayer: this.playerId, serverCardEffects: serverEffectStack }
        Server.$.send(Signal.RESOLVEACTIONS, data2);

        // ActionManager.actionHasCardEffect = true;
        // ActionManager.cardEffectToDo = { playedCard: activatedCard, playerId: this.playerId }
        // //after each reaction all players get a new reaction chance so all of the booleans turn to false.
        // // let newBooleans: boolean[] = [];
        // // for (let i = 0; i < data.booleans.length; i++) {
        // //   newBooleans.push(false);
        // // }
        // // data.booleans = newBooleans;
        // //set last player id which made a reaction
        // data.lastPlayerTakenAction = this.playerId;
        // ActionManager.sendGetReactionToNextPlayer(data);
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
  async chooseCardToActivate(card: cc.Node): Promise<ServerEffect> {
    let serverCardEffect = await CardManager.activateCard(card, this.playerId);



    return new Promise((resolve, reject) => {
      resolve(serverCardEffect);
    });
  }

  setDice(dice: cc.Node) {
    this.node.addChild(dice);
    this.dice = dice.getComponent(Dice);
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
    charWidget.isAlignRight = true;
    charItemWidget.isAlignRight = true;
    characterLayoutWidget.isAlignRight = true;
    charWidget.right = 180 + CARD_WIDTH * (1 / 3);
    charItemWidget.right = 180 + CARD_WIDTH * (1 / 3);
    characterLayoutWidget.right = 180 + CARD_WIDTH * (1 / 3);
    charWidget.isAlignTop = true;
    charItemWidget.isAlignBottom = true;
    characterLayoutWidget.isAlignTop = true;
    // charWidget.top = -75;
    charWidget.top = 5;
    characterLayoutWidget.top = 0 + 15;
    charItemWidget.bottom = 5;
    this.Hp = character.getComponent(Character).Hp;
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
