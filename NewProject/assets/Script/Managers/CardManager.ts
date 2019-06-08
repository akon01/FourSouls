import ChooseCardToPlay from "../CardEffectComponents/DataCollector/ChooseCardToPlay";
import { CARD_TYPE, BLINKINGSPEED } from "../Constants";
import Card from "../Entites/Card";
import CardEffect from "../Entites/CardEffect";
import { CardLayout } from "../Entites/CardLayout";
import CardPreview from "../Entites/CardPreview";
import Character from "../Entites/CardTypes/Character";
import CharacterItem from "../Entites/CardTypes/CharacterItem";
import Item from "../Entites/CardTypes/Item";
import Deck from "../Entites/Deck";
import Player from "../Entites/Player";
import { ServerCardEffect } from "../Entites/ServerCardEffect";
import MonsterAttackable from "../Modules/MonsterAttackable";
import { COLORS, printMethodEnded, printMethodStarted } from "./../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardManager extends cc.Component {
  static cardsId: number = 0;

  static onTableCards: cc.Node[] = [];

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
    //cc.log('%cwaitForPrefabLoad():', 'color:#4A3;');
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

  @printMethodStarted(COLORS.RED)
  static doCardEffectFromServer(serverCardEffect: ServerCardEffect) {
    cc.log(serverCardEffect);
    let card = this.getCardById(serverCardEffect.cardId);
    card
      .getComponent(CardEffect)
      .doEffectFromServerCardEffect(serverCardEffect);
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
  /**
   *
   * @param cardId a card id to get from all cards
   */
  static getCardById(cardId: number) {
    for (let i = 0; i < CardManager.allCards.length; i++) {
      const card: Card = CardManager.allCards[i].getComponent("Card");
      if (card.cardId == cardId) {
        return card.node;
      }
    }
  }

  static makeDeckCards(deck: Deck) {
    //cc.log('%cmakeDeckCards():', 'color:#4A3;');
    let cardsToBeMade: cc.Prefab[] = deck.cardsPrefab;
    for (let i = 0; i < cardsToBeMade.length; i++) {
      const newCard: cc.Node = cc.instantiate(cardsToBeMade[i]);
      newCard.parent = cc.director.getScene();
      switch (deck.deckType) {
        case CARD_TYPE.LOOT:
          CardManager.lootCardPool.put(newCard);
          break;
        case CARD_TYPE.MONSTER:
          CardManager.monsterCardPool.put(newCard);
          break;
        case CARD_TYPE.TREASURE:
          CardManager.treasureCardPool.put(newCard);
          break;
        default:
          break;
      }
      let CardComp: Card = newCard.getComponent("Card");
      CardComp.cardId = ++CardManager.cardsId;
      CardComp.frontSprite = newCard.getComponent(cc.Sprite).spriteFrame;
      deck.addToDeckOnTop(newCard);
    }
  }

  static makeCharDeck() {
    ////cc.log('make char deck')
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
    if (monsterCard.getComponent(MonsterAttackable) == null) {
      let attackableComp = monsterCard.addComponent(MonsterAttackable);
    } else {
      monsterCard.getComponent(MonsterAttackable).enabled = true;
    }
  }

  static makeMonsterNotAttackable(monsterCard: cc.Node) {
    if (monsterCard.getComponent(MonsterAttackable) != null) {
      monsterCard.getComponent(MonsterAttackable).enabled = false;
    }
  }

  static makeItemBuyable(itemCard: cc.Node, player: Player) {
    itemCard.off(cc.Node.EventType.TOUCH_START, () => {
      player.buyItem(itemCard);
    });
    itemCard.once(cc.Node.EventType.TOUCH_START, () => {
      player.buyItem(itemCard);
    });
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
      player.drawCard(deck);
    });
    deck.once(cc.Node.EventType.TOUCH_START, () => {
      player.drawCard(deck);
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
        cc.log("card for preview " + card.name);
        cardPreview.showCardPreview(card, false);
      },
      this
    );
  }

  static disableCardActions(card: cc.Node) {
    card.off(cc.Node.EventType.TOUCH_START);
  }

  static makeRequiredForDataCollector(
    dataCollector: ChooseCardToPlay,
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

  static async getCardEffect(
    card: cc.Node,
    playerId: number
  ): Promise<ServerCardEffect> {
    //cc.log('%cgetCardEffect():', 'color:#4A3;');
    let serverCardEffect = await this.activateCard(card, playerId);
    //currently send card after card effect send only serverCardEffect object
    cc.log("activated " + card.name);
    return new Promise((resolve, reject) => {
      resolve(serverCardEffect);
    });
  }

  static async activateCard(
    card: cc.Node,
    cardPlayerId: number
  ): Promise<ServerCardEffect> {
    let cardPlayedData = {
      cardPlayerId: cardPlayerId,
      cardId: card.getComponent(Card).cardId
    };
    let serverCardEffect = await card
      .getComponent(CardEffect)
      .getServerCardEffect(cardPlayedData);
    return new Promise((resolve, reject) => {
      resolve(serverCardEffect);
    });
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

  static getOtherPlayersHandCards(player: cc.Node) {
    let otherPlayersHandCards: cc.Node[] = [];
    let playerHandComp: CardLayout = player.getComponentInChildren(
      "CardLayout"
    );
    otherPlayersHandCards = CardManager.allCards.filter(
      (card, index, cards) => {
        //if not in the given players hand or on the table

        if (
          playerHandComp.layoutCards.indexOf(card) == -1 &&
          CardManager.onTableCards.indexOf(card) == -1
        ) {
          return true;
        }
      },
      this
    );

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
