import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import {
  BLINKINGSPEED,
  CARD_TYPE,
  printMethodStarted,
  COLORS
} from "../Constants";
import CardEffect from "../Entites/CardEffect";
import { CardLayout } from "../Entites/CardLayout";
import CardPreview from "../Entites/CardPreview";
import Character from "../Entites/CardTypes/Character";
import Card from "../Entites/GameEntities/Card";
import Deck from "../Entites/GameEntities/Deck";
import Player from "../Entites/GameEntities/Player";
import { ServerEffect } from "../Entites/ServerCardEffect";
import MonsterField from "../Entites/MonsterField";
import MonsterCardHolder from "../Entites/MonsterCardHolder";
import Store from "../Entites/GameEntities/Store";
import PlayerManager from "./PlayerManager";
import Dice from "../Entites/GameEntities/Dice";
import PileManager from "./PileManager";
import Item from "../Entites/CardTypes/Item";
import PassiveManager from "./PassiveManager";
import TurnsManager from "./TurnsManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardManager extends cc.Component {
  static cardsId: number = 0;

  static onTableCards: cc.Node[] = [];

  static inDecksCards: cc.Node[] = [];

  static allCards: cc.Node[] = [];

  static allPlayers: cc.Node[] = [];

  static currentPlayer: cc.Node = null;

  static previewOnlyCards: cc.Node[] = [];

  static interactableCards: cc.Node[] = [];

  static lootDeck: cc.Node = null;

  static monsterDeck: cc.Node = null;

  static treasureDeck: cc.Node = null;

  static characterDeck: { char: cc.Node; item: cc.Node }[] = [];

  static characterItemDeck: cc.NodePool = null;

  static cardPrefab: cc.Prefab = null;

  static charCardsPrefabs = [];

  static charItemCardsPrefabs = [];

  static charCardBack: cc.SpriteFrame = null;

  static monsterCardBack: cc.SpriteFrame = null;

  static lootCardBack: cc.SpriteFrame = null;

  static treasureCardBack: cc.SpriteFrame = null;

  static extraSoulsBack: cc.SpriteFrame = null;

  static CharItemBack: cc.SpriteFrame = null;

  static charCardSprites: cc.SpriteFrame[] = [];

  static monsterCardSprites: cc.SpriteFrame[] = [];

  static lootCardSprites: cc.SpriteFrame[] = [];

  static treasureCardSprites: cc.SpriteFrame[] = [];

  static extraSoulsSprites: cc.SpriteFrame[] = [];

  static CharItemSprites: cc.SpriteFrame[] = [];

  static charCardPool: cc.NodePool = null;

  static lootCardPool: cc.NodePool = null;

  static monsterCardPool: cc.NodePool = null;

  static treasureCardPool: cc.NodePool = null;

  static extraSoulsCardPool: cc.NodePool = null;

  static CharItemCardPool: cc.NodePool = null;

  static prefabLoaded: boolean = false;

  static async init() {
    let loaded = await this.preLoadPrefabs();
    CardManager.treasureDeck = cc.find("Canvas/TreasureDeck");
    CardManager.CharItemCardPool = new cc.NodePool();
    CardManager.extraSoulsCardPool = new cc.NodePool();
    CardManager.lootCardPool = new cc.NodePool();
    CardManager.charCardPool = new cc.NodePool();
    CardManager.monsterCardPool = new cc.NodePool();
    CardManager.treasureCardPool = new cc.NodePool();

    var lootDeckComp: Deck = CardManager.lootDeck.getComponent("Deck");
    var treasureDeckComp: Deck = CardManager.treasureDeck.getComponent("Deck");
    var monsterDeckComp: Deck = CardManager.monsterDeck.getComponent("Deck");

    let decks: Deck[] = [lootDeckComp, treasureDeckComp, monsterDeckComp];

    for (let i = 0; i < decks.length; i++) {
      const deck = decks[i];
      this.makeDeckCards(deck);
    }

    this.makeCharDeck();
  }

  static async preLoadPrefabs() {
    cc.loader.loadResDir("Prefabs/CharacterCards/CharCardsPrefabs", function(
      err,
      rsc,
      urls
    ) {
      for (let i = 0; i < rsc.length; i++) {
        const prefab = rsc[i];
        CardManager.charCardsPrefabs.push(prefab);
      }
      cc.loader.loadResDir("Prefabs/CharacterCards/CharItemCards", function(
        err,
        rsc,
        url
      ) {
        for (let i = 0; i < rsc.length; i++) {
          const prefab = rsc[i];
          CardManager.charItemCardsPrefabs.push(prefab);
        }
        cc.loader.loadResDir(
          "Sprites/CardBacks",
          cc.SpriteFrame,
          (err, rsc, urls) => {
            for (let i = 0; i < rsc.length; i++) {
              const sprite: cc.SpriteFrame = rsc[i];
              switch (sprite.name) {
                case "LootBack":
                  CardManager.lootCardBack = sprite;
                  break;
                case "MonsterBack":
                  CardManager.monsterCardBack = sprite;
                  break;
                case "TreasureBack":
                  CardManager.treasureCardBack = sprite;
                  break;
                default:
                  break;
              }
            }
            CardManager.prefabLoaded = true;
          }
        );
      });
    });

    let loaded = await this.waitForPrefabLoad();
    return loaded;
  }

  static async waitForPrefabLoad(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let timesChecked = 0;
      let check = () => {
        if (CardManager.prefabLoaded == true) {
          resolve(true);
        } else if (timesChecked < 1000) {
          timesChecked++;
          setTimeout(check, 50);
        } else {
          reject("checked 100 times");
        }
      };
      setTimeout(check, 50);
    });
  }

  static async doCardEffectFromServer(
    serverEffect: ServerEffect,
    allServerEffects: ServerEffect[]
  ): Promise<ServerEffect[]> {
    let card = this.getCardById(serverEffect.cardId);
    let serverEffectStack = await card
      .getComponent(CardEffect)
      .doEffectFromServerEffect(serverEffect, allServerEffects);
    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }

  static getDeckByType(deckType) {
    switch (deckType) {
      case CARD_TYPE.LOOT:
        return CardManager.lootDeck;
      case CARD_TYPE.MONSTER:
        return CardManager.monsterDeck;
      case CARD_TYPE.TREASURE:
        return CardManager.treasureDeck;
      default:
        break;
    }
  }

  static checkForEmptyFields() {
    let monsterField = this.monsterDeck.getComponentInChildren(MonsterField);
    MonsterField.updateActiveMonsters();
    if (monsterField.maxNumOfMonsters > MonsterField.activeMonsters.length) {
      let emptyHolders = MonsterField.monsterCardHolders.filter(
        holder => holder.getComponent(MonsterCardHolder).monsters.length == 0
      );
      for (const holder of emptyHolders) {
        holder.getComponent(MonsterCardHolder).getNextMonster();
      }
    }

    if (Store.storeCards.length < Store.maxNumOfItems) {
      let diff = Store.maxNumOfItems - Store.storeCards.length;
      for (let i = 0; i < diff; i++) {
        Store.$.addStoreCard();
      }
    }
  }
  /**
   * Serch in allCards and Decks for a matching card/Deck
   * @param cardId a card id to get from all cards
   */
  static getCardById(cardId: number, includeInDecksCards?: boolean): cc.Node {
    for (let i = 0; i < CardManager.allCards.length; i++) {
      const card: Card = CardManager.allCards[i].getComponent("Card");
      if (card.cardId == cardId) {
        return card.node;
      }
    }
    const decks = CardManager.getAllDecks();
    for (let i = 0; i < decks.length; i++) {
      const deck = decks[i].getComponent(Deck);
      if (deck.cardId == cardId) {
        return deck.node;
      }
    }
    for (let i = 0; i < PlayerManager.dice.length; i++) {
      const dice = PlayerManager.dice[i].getComponent(Dice);
      if (dice.diceId == cardId) {
        return dice.node;
      }
    }
    if (includeInDecksCards) {
      for (let i = 0; i < this.inDecksCards.length; i++) {
        const inDeckCard = this.inDecksCards[i].getComponent(Card);

        if (inDeckCard.cardId == cardId) {
          return inDeckCard.node;
        }
      }
    }
  }

  static makeDeckCards(deck: Deck) {
    let cardsToBeMade: cc.Prefab[] = deck.cardsPrefab;
    for (let i = 0; i < cardsToBeMade.length; i++) {
      const newCard: cc.Node = cc.instantiate(cardsToBeMade[i]);
      newCard.parent = cc.director.getScene();
      let cardComp: Card = newCard.getComponent("Card");
      switch (deck.deckType) {
        case CARD_TYPE.LOOT:
          cardComp.backSprite = CardManager.lootCardBack;
          CardManager.lootCardPool.put(newCard);
          break;
        case CARD_TYPE.MONSTER:
          cardComp.backSprite = CardManager.monsterCardBack;

          break;
        case CARD_TYPE.TREASURE:
          cardComp.backSprite = CardManager.treasureCardBack;
          CardManager.treasureCardPool.put(newCard);
          break;
        default:
          break;
      }
      deck.cardId = ++CardManager.cardsId;
      cardComp.cardId = ++CardManager.cardsId;
      cardComp.frontSprite = newCard.getComponent(cc.Sprite).spriteFrame;
      this.inDecksCards.push(newCard);
      cardComp.flipCard();

      deck.addToDeckOnTop(newCard);
    }
  }

  static makeCharDeck() {
    let characterNode: cc.Node;
    let characterItemNode: cc.Node;

    for (let j = 0; j < CardManager.charCardsPrefabs.length; j++) {
      characterNode = cc.instantiate(CardManager.charCardsPrefabs[j]);
      characterItemNode = cc.instantiate(
        characterNode.getComponent(Character).charItemPrefab
      );
      characterNode.getComponent(Card).cardId = ++CardManager.cardsId;
      characterItemNode.getComponent(Card).cardId = ++CardManager.cardsId;
      let fullCharCards: { char: cc.Node; item: cc.Node } = {
        char: characterNode,
        item: characterItemNode
      };
      characterNode.parent = cc.director.getScene();
      characterItemNode.parent = cc.director.getScene();
      CardManager.characterDeck.push(fullCharCards);
      //CardManager.characterItemDeck.put(characterItemNode)
    }
  }

  static makeMonsterAttackable(monsterCard: cc.Node) {
    let cardPreview = cc.find("Canvas/CardPreview").getComponent(CardPreview);
    monsterCard.once(
      cc.Node.EventType.TOUCH_START,
      () => {
        cardPreview.showCardPreview(monsterCard, false, false, true);
      },
      this
    );
  }

  static makeItemBuyable(itemCard: cc.Node, player: Player) {
    let cardPreview = cc.find("Canvas/CardPreview").getComponent(CardPreview);
    itemCard.off(cc.Node.EventType.TOUCH_START);
    itemCard.once(
      cc.Node.EventType.TOUCH_START,
      () => {
        cardPreview.showCardPreview(itemCard, false, false, false, true);
      },
      this
    );
  }

  static makeLootPlayable(lootCard: cc.Node, player: Player) {
    let cardPreview = cc.find("Canvas/CardPreview").getComponent(CardPreview);
    lootCard.once(cc.Node.EventType.TOUCH_START, () => {
      cardPreview.showCardPreview(lootCard, false, true);
    });
  }

  static makeItemActivateable(item: cc.Node) {
    let cardPreview = cc.find("Canvas/CardPreview").getComponent(CardPreview);
    item.once(
      cc.Node.EventType.TOUCH_START,
      () => {
        cardPreview.showCardPreview(item, true);
      },
      this
    );
  }

  static makeDeckDrawable(deck: cc.Node, player: Player) {
    deck.off(cc.Node.EventType.TOUCH_START, () => {
      player.drawCard(deck, true);
    });
    deck.once(cc.Node.EventType.TOUCH_START, () => {
      player.drawCard(deck, true);
    });
  }

  static makeCardReactable(card: cc.Node, reactablePlayer: cc.Node) {
    card.off(cc.Node.EventType.TOUCH_START, () => {
      reactablePlayer.getComponent(Player).activateCard(card);
    });
    card.once(cc.Node.EventType.TOUCH_START, () => {
      reactablePlayer.getComponent(Player).activateCard(card);
    });
  }

  static makeDeckNotDrawable(deck: cc.Node) {
    deck.off(cc.Node.EventType.TOUCH_START);
  }

  static makeCardPreviewable(card: cc.Node) {
    let cardPreview = cc.find("Canvas/CardPreview").getComponent(CardPreview);
    card.on(
      cc.Node.EventType.TOUCH_START,
      () => {
        cardPreview.showCardPreview(card, false);
      },
      this
    );
  }

  static disableCardActions(card: cc.Node) {
    card.off(cc.Node.EventType.TOUCH_START);
  }

  static makeRequiredForDataCollector(
    dataCollector: DataCollector,
    card: cc.Node
  ) {
    card.runAction(
      cc
        .sequence(cc.fadeTo(BLINKINGSPEED, 50), cc.fadeTo(BLINKINGSPEED, 255))
        .repeatForever()
    );
    card.once(cc.Node.EventType.TOUCH_START, () => {
      dataCollector.cardChosen = card;
      dataCollector.isCardChosen = true;
    });
  }

  static unRequiredForDataGather(card: cc.Node) {
    card.stopAllActions();
    card.off(cc.Node.EventType.TOUCH_START);
  }

  static requireLootPlay(cards: cc.Node[]) {}

  @printMethodStarted(COLORS.RED)
  static async getCardEffect(
    card: cc.Node,
    playerId: number,
    cardEffectIndex?: number
  ): Promise<ServerEffect> {
    let serverCardEffect;
    cc.log(cardEffectIndex);
    if (cardEffectIndex != null) {
      serverCardEffect = await this.activateCard(
        card,
        playerId,
        cardEffectIndex
      );
    } else {
      serverCardEffect = await this.activateCard(card, playerId);
    }
    //currently send card after card effect send only serverCardEffect object
    cc.log("activated " + card.name);
    return new Promise((resolve, reject) => {
      resolve(serverCardEffect);
    });
  }

  static async activateCard(
    card: cc.Node,
    cardPlayerId: number,
    cardEffectIndex?: number
  ): Promise<ServerEffect> {
    let cardId;
    cc.log("activate card");
    if (card.getComponent(Card) != null) {
      cardId = card.getComponent(Card).cardId;
    } else {
      cardId = card.getComponent(Dice).diceId;
    }
    let cardPlayedData = {
      cardPlayerId: cardPlayerId,
      cardId: cardId
    };
    let serverCardEffect;
    if (cardEffectIndex != null) {
      serverCardEffect = await card
        .getComponent(CardEffect)
        .getServerEffect(cardPlayedData, cardEffectIndex);
    } else {
      serverCardEffect = await card
        .getComponent(CardEffect)
        .getServerEffect(cardPlayedData);
    }
    return new Promise((resolve, reject) => {
      resolve(serverCardEffect);
    });
  }

  static updatePlayerCards() {
    let players = PlayerManager.players;
    for (let i = 0; i < players.length; i++) {
      const player = players[i].getComponent(Player);
      player.handCards = [];
      player.deskCards = [];

      player.handCards = player.handCards.concat(player.hand.layoutCards);

      player.deskCards = player.deskCards.concat(
        player.desk.activeItemLayout.getComponent(CardLayout).layoutCards,
        player.desk.passiveItemLayout.getComponent(CardLayout).layoutCards
      );
      // player.deskCards = player.deskCards.concat(
      //   player.desk.passiveItemLayout.getComponent(CardLayout).layoutCards
      // );
      player.deskCards.push(player.characterItem);
      player.deskCards.push(player.character);
      if (PlayerManager.mePlayer == player.node) {
        for (const handCard of player.handCards) {
          if (handCard.getComponent(Card).isFlipped) {
            handCard.getComponent(Card).flipCard();
          }
        }
      }
    }
  }

  static updateOnTableCards() {
    this.onTableCards = [];
    this.onTableCards = this.onTableCards.concat(
      Store.storeCards,
      MonsterField.activeMonsters,
      PileManager.lootCardPile,
      PileManager.treasureCardPile,
      PileManager.monsterCardPile
    );
    // this.onTableCards.concat(MonsterField.activeMonsters);
    // this.onTableCards.concat(PileManager.lootCardPile);
    // this.onTableCards.concat(PileManager.treasureCardPile);
    // this.onTableCards.concat(PileManager.monsterCardPile);
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const player = PlayerManager.players[i].getComponent(Player);
      this.onTableCards = this.onTableCards.concat(player.deskCards);
    }
    for (const tableCard of this.onTableCards) {
      if (tableCard.getComponent(Card).isFlipped) {
        tableCard.getComponent(Card).flipCard();
      }
    }
  }

  static updatePassiveListeners() {
    PassiveManager.clearAllListeners();
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const player = PlayerManager.players[i].getComponent(Player);
      for (let j = 0; j < player.deskCards.length; j++) {
        const item = player.deskCards[j];
        PassiveManager.registerPassiveItem(item);
      }
      //PassiveManager.registerPassiveItem(player.characterItem);
    }
    //add register of active monster effects
  }

  static getAllDecks() {
    let decks: cc.Node[] = [];
    decks.push(
      CardManager.lootDeck,
      CardManager.monsterDeck,
      CardManager.treasureDeck
    );
    return decks;
  }

  static setOriginalSprites(cards: cc.Node[]) {
    for (let i = 0; i < cards.length; i++) {
      const cardNode = cards[i];
      let cardComp: Card = cardNode.getComponent("Card");
      let cardSprite: cc.Sprite = cardNode.getComponent(cc.Sprite);
      cardSprite.spriteFrame = cardComp.frontSprite;
    }
  }

  static removeFromInAllDecksCards(cardToRemove: cc.Node) {
    let index = this.inDecksCards.indexOf(cardToRemove);
    if (this.inDecksCards.length < index) {
      this.inDecksCards.splice(index, 1);
    }
  }

  static getOtherPlayersHandCards(player: cc.Node) {
    let otherPlayersHandCards: cc.Node[] = [];
    let playerHandComp: CardLayout = player.getComponentInChildren(
      "CardLayout"
    );
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const player = PlayerManager.players[i].getComponent(Player);
      otherPlayersHandCards.concat(player.handCards);
    }
    // otherPlayersHandCards = CardManager.allCards.filter(
    //   (card, index, cards) => {
    //     //if not in the given players hand or on the table

    //     if (
    //       playerHandComp.layoutCards.indexOf(card) == -1 &&
    //       CardManager.onTableCards.indexOf(card) == -1
    //     ) {
    //       return true;
    //     }
    //   },
    //   this
    // );

    return otherPlayersHandCards;
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    CardManager.lootDeck = cc.find("Canvas/LootDeck");
    CardManager.monsterDeck = cc.find("Canvas/MonsterDeck");
    CardManager.treasureDeck = cc.find("Canvas/TreasureDeck");
  }

  start() {}

  // update (dt) {}
}
