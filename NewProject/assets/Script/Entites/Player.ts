import { CardLayout } from "./CardLayout";
import PlayerDesk from "./PlayerDesk";
import {
  CARD_WIDTH,
  CARD_TYPE,
  ITEM_TYPE,
  printMethodStarted,
  COLORS,
  TIMETOREACTONACTION
} from "../Constants";
import Card from "./Card";
import Item from "./CardTypes/Item";
import Dice from "./Dice";
import Character from "./CardTypes/Character";
import CharacterItem from "./CardTypes/CharacterItem";
import PlayerManager from "../Managers/PlayerManager";
import CardManager from "../Managers/CardManager";
import Server from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import ActionManager from "../Managers/ActionManager";
import { ServerEffect } from "./ServerCardEffect";
import {
  DrawCardAction,
  BuyItemAction,
  MoveLootToPile,
  ActivateItemAction
} from "./Action";
import PileManager from "../Managers/PileManager";
import Deck from "./Deck";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {
  @property
  playerId: number = 0;

  @property
  playerServerId: number = 0;

  @property(cc.Node)
  handNode: cc.Node = null;

  @property(cc.Component)
  hand: CardLayout = null;

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

  @printMethodStarted(COLORS.GREEN)
  drawCard(deck: cc.Node, isFromServer: boolean) {
    let drawnCard = deck.getComponent(Deck).drawCard();

    let drawAction = new DrawCardAction({ drawnCard }, this.playerId);
    let serverData;

    serverData = {
      signal: Signal.CARDDRAWED,
      srvData: { player: this.playerId, deck: CARD_TYPE.LOOT }
    };

    ActionManager.showSingleAction(drawAction, serverData, !isFromServer);
  }

  discardLoot(lootCard: cc.Node) {
    let playerId = this.playerId;
    let discardAction = new MoveLootToPile(
      { lootCard: lootCard },
      this.playerId
    );
    let cardId = lootCard.getComponent(Card).cardId;
    let serverData = {
      signal: Signal.DISCRADLOOT,
      srvData: { playerId: playerId, cardId: cardId }
    };
    ActionManager.showSingleAction(discardAction, serverData);
  }

  buyItem(itemToBuy: cc.Node) {
    let itemCardComp: Card = itemToBuy.getComponent(Card);
    let playerDeskComp = this.desk;
    let playerId = this.playerId;
    let cardId = itemCardComp.cardId;
    let serverData = {
      signal: Signal.ADDANITEM,
      srvData: { playerId, cardId }
    };
    let action = new BuyItemAction({
      movedCard: itemToBuy,
      playerDeskComp: playerDeskComp
    });
    ActionManager.doAction(action, serverData);
  }

  playLootCard(lootCard: cc.Node, isFromServer: boolean) {
    let playerId = this.playerId;
    let cardId = lootCard.getComponent("Card").cardId;
    let serverData = {
      signal: Signal.PLAYLOOTCARD,
      srvData: { playerId: playerId, cardId: cardId }
    };
    let action = new MoveLootToPile({ lootCard: lootCard }, playerId);
    if (isFromServer) {
      ActionManager.doSingleAction(action, serverData);
    } else {
      ActionManager.doAction(action, serverData);
    }
  }

  activateItem(item: cc.Node, isFromServer: boolean) {
    let playerId = this.playerId;
    let cardId = item.getComponent("Card").cardId;
    let serverData = {
      signal: Signal.ACTIVATEITEM,
      srvData: { playerId: playerId, cardId: cardId }
    };
    let action = new ActivateItemAction({ activatedCard: item }, playerId);
    if (isFromServer) {
      ActionManager.doSingleAction(action, serverData);
    } else {
      ActionManager.doAction(action, serverData);
    }
  }

  activateCard(card: cc.Node) {
    this.activatedCard = card;
    this.cardActivated = true;
  }

  changeMoney(numOfCoins: number) {
    this.coins += numOfCoins;
  }

  setDesk(desk: cc.Node) {
    this.node.addChild(desk);
    this.landingZones.push(desk);
    this.desk = desk.getComponent(PlayerDesk);
  }

  calculateReactions() {
    this.reactCardNode = [];

    for (let i = 0; i < this.activeItems.length; i++) {
      const activeItem = this.activeItems[i].getComponent(Item);
      if (!activeItem.activated) {
        this.reactCardNode.push(activeItem.node);
      }
    }
    if (!this.character.getComponent(Character).activated) {
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
      let s = cc.sequence(
        cc.fadeTo(0.5, 255 / 2),
        cc.fadeTo(0.5, 255),
        cc.fadeTo(0.5, 255 / 2),
        cc.fadeTo(0.5, 255)
      );
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
      this.timeToRespondTimeOut = setTimeout(
        this.blockAvailableReactionsTimeout,
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
        let serverCardEffect = await CardManager.getCardEffect(
          activatedCard,
          this.playerId
        );
        //after each reaction all players get a new reaction chance so all of the booleans turn to false.
        let newBooleans: boolean[] = [];
        for (let i = 0; i < data.booleans.length; i++) {
          newBooleans.push(false);
        }
        data.booleans = newBooleans;
        //push the card effect to the new data
        data.serverCardEffects.push(serverCardEffect);
        //set last player id which made a reaction
        data.lastPlayerTakenAction = this.playerId;
        ActionManager.sendGetReactionToNextPlayer(data);
        //   this.reactionData = data
        // for (let j = 0; j < this.reactCardNode.length; j++) {
        //     const card = this.reactCardNode[j];
        //     card.getComponent(Card).enableMoveComps()
        // }
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
      setTimeout(check, 50);
    });
  }

  //currently return boolean , later change to return a promise with the card effect.
  async chooseCardToActivate(card: cc.Node): Promise<ServerEffect> {
    let serverCardEffect = await CardManager.activateCard(card, this.playerId);

    cc.log("activated " + card.name);

    return new Promise((resolve, reject) => {
      resolve(serverCardEffect);
    });
  }

  setDice(dice: cc.Node) {
    this.node.addChild(dice);
    this.dice = dice.getComponent(Dice);
  }

  addItem(cardItemComp: Item, card: cc.Node) {
    switch (cardItemComp.type) {
      case ITEM_TYPE.ACTIVE:
        this.activeItems.push(card);
        break;
      case ITEM_TYPE.PASSIVE:
        this.passiveItems.push(card);
        break;
      default:
        break;
    }
    this.cards.push(card);
  }

  setCharacter(character: cc.Node, characterItem: cc.Node) {
    //cc.log('set character')
    character.setParent(this.desk.node);
    characterItem.setParent(this.desk.node);
    let charWidget = character.addComponent(cc.Widget);
    let charItemWidget = characterItem.addComponent(cc.Widget);
    charWidget.target = character.parent;
    charItemWidget.target = characterItem.parent;
    charWidget.isAlignRight = true;
    charItemWidget.isAlignRight = true;
    charWidget.right = 180 + CARD_WIDTH * (1 / 3);
    charItemWidget.right = 180 + CARD_WIDTH * (1 / 3);
    charWidget.isAlignTop = true;
    charItemWidget.isAlignTop = true;
    charWidget.top = -75;
    charItemWidget.top = 5;

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

  start() {}

  // update (dt) {}
}
