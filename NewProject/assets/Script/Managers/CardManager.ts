import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import {
  BLINKINGSPEED,
  CARD_TYPE,
  printMethodStarted,
  COLORS,
  TIMETOBUY,
  ITEM_TYPE,
  TIMETODRAW
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
import Monster from "../Entites/CardTypes/Monster";
import Server from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import CardPreviewManager from "./CardPreviewManager";
import CharacterItem from "../Entites/CardTypes/CharacterItem";


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

    var lootDeckComp: Deck = CardManager.lootDeck.getComponent(Deck);
    var treasureDeckComp: Deck = CardManager.treasureDeck.getComponent(Deck);
    var monsterDeckComp: Deck = CardManager.monsterDeck.getComponent(Deck);

    let decks: Deck[] = [lootDeckComp, treasureDeckComp, monsterDeckComp];

    for (let i = 0; i < decks.length; i++) {
      const deck = decks[i];

      this.makeDeckCards(deck);
    }

    this.makeCharDeck();
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  static async preLoadPrefabs() {
    cc.loader.loadResDir("Prefabs/CharacterCards/CharCardsPrefabs", function (
      err,
      rsc,
      urls
    ) {
      for (let i = 0; i < rsc.length; i++) {
        const prefab = rsc[i];
        CardManager.charCardsPrefabs.push(prefab);
      }
      cc.loader.loadResDir("Prefabs/CharacterCards/CharItemCards", function (
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
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  static async doEffectFromServer(
    serverEffect: ServerEffect,
    allServerEffects: ServerEffect[]
  ) {
    let card = this.getCardById(serverEffect.cardId, true);
    let serverEffectStack = await card
      .getComponent(CardEffect)
      .doServerEffect(serverEffect, allServerEffects);
    return new Promise((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }

  static getDeckByType(deckType: CARD_TYPE) {
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

  static isCheckingForEmptyFields: boolean = false;

  static async checkForEmptyFields() {
    if (
      PlayerManager.mePlayer ==
      PlayerManager.getPlayerById(TurnsManager.currentTurn.PlayerId)
    ) {
      if (this.isCheckingForEmptyFields) {
        let over = await this.waitForCheck()
      }
      this.isCheckingForEmptyFields = true;

      let monsterField = this.monsterDeck.getComponentInChildren(MonsterField);
      MonsterField.updateActiveMonsters();
      if (monsterField.maxNumOfMonsters > MonsterField.activeMonsters.length) {
        let emptyHolders = MonsterField.monsterCardHolders.filter(
          holder => holder.getComponent(MonsterCardHolder).monsters.length == 0
        );
        for (let i = 0; i < emptyHolders.length; i++) {
          const holder = emptyHolders[i];
          let newMonster = this.monsterDeck.getComponent(Deck).drawCard(true)
          let over = await holder.getComponent(MonsterCardHolder).addToMonsters(newMonster, true)
        }
        cc.log('after add to empty fields')
      }

      if (Store.storeCards.length < Store.maxNumOfItems) {
        let diff = Store.maxNumOfItems - Store.storeCards.length;
        for (let i = 0; i < diff; i++) {
          Store.$.addStoreCard(true);
        }

      }
      this.isCheckingForEmptyFields = false;
    }
  }

  static async waitForCheck(): Promise<boolean> {
    //w8 for a server message with a while,after the message is recived (should be a stack of effects with booleans) resolve with stack of effects.
    return new Promise((resolve, reject) => {
      let check = () => {
        if (this.isCheckingForEmptyFields == false) {
          resolve(true);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  /**
   * Serch in allCards and Decks for a matching card/Deck
   * @param cardId a card id to get from all cards
   */
  static getCardById(cardId: number, includeInDecksCards?: boolean): cc.Node {
    for (let i = 0; i < CardManager.allCards.length; i++) {
      const card: Card = CardManager.allCards[i].getComponent(Card);
      if (card._cardId == cardId) {
        return card.node;
      }
    }
    const decks = CardManager.getAllDecks();
    for (let i = 0; i < decks.length; i++) {
      const deck = decks[i].getComponent(Deck);
      if (deck._cardId == cardId) {
        return deck.node;
      } else {
        if (deck.topBlankCard.getComponent(Card)._cardId == cardId) {
          return deck.topBlankCard;
        } else if (deck.node.getComponent(Card)._cardId == cardId) {
          return deck.node;
        }
      }
    }
    for (let i = 0; i < PlayerManager.dice.length; i++) {
      const dice = PlayerManager.dice[i].getComponent(Dice);
      if (dice.diceId == cardId) {
        return dice.node;
      }
    }
    for (let i = 0; i < PlayerManager.players.map(player => player.getComponent(Player)).length; i++) {
      const player = PlayerManager.players.map(player => player.getComponent(Player))[i];
      for (let j = 0; j < player.deskCards.length; j++) {
        const card = player.deskCards[j].getComponent(Card);
        if (card._cardId == cardId) {
          return card.node;
        }
      }
      for (let j = 0; j < player.handCards.length; j++) {
        const card = player.handCards[j].getComponent(Card);
        if (card._cardId == cardId) {
          return card.node;
        }
      }
      for (let j = 0; j < player.activeItems.length; j++) {
        const card = player.activeItems[j].getComponent(Card);
        if (card._cardId == cardId) {
          return card.node;
        }
      }
    }

    if (includeInDecksCards) {
      for (let i = 0; i < this.inDecksCards.length; i++) {
        const inDeckCard = this.inDecksCards[i].getComponent(Card);

        if (inDeckCard._cardId == cardId) {
          return inDeckCard.node;
        }
      }
    }
    return null;

  }

  static makeDeckCards(deck: Deck) {
    deck.node.getComponent(Card)._cardId = ++this.cardsId
    let cardsToBeMade: cc.Prefab[] = deck.cardsPrefab;
    for (let i = 0; i < cardsToBeMade.length; i++) {
      let newCard: cc.Node = cc.instantiate(cardsToBeMade[i]);
      //newCard.parent = cc.director.getScene();
      let cardComp: Card = newCard.getComponent(Card);
      newCard.getComponent(Card).frontSprite = newCard.getComponent(cc.Sprite).spriteFrame;
      //cc.log(newCard.getComponent(Card).frontSprite)
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
      if (deck._cardId == -1) {

        deck._cardId = ++CardManager.cardsId;
      }
      cardComp._cardId = ++CardManager.cardsId;


      cardComp.flipCard();
      deck.addToDeckOnTop(newCard, false);
    }
    cc.log(deck._cards.map(card => card.getComponent(Card)))

  }


  static makeCharDeck() {
    let characterNode: cc.Node;
    let characterItemNode: cc.Node;

    for (let j = 0; j < CardManager.charCardsPrefabs.length; j++) {
      characterNode = cc.instantiate(CardManager.charCardsPrefabs[j]);
      characterItemNode = cc.instantiate(
        characterNode.getComponent(Character).charItemPrefab
      );
      characterNode.getComponent(Card)._cardId = ++CardManager.cardsId;
      characterNode.getComponent(Card).frontSprite = characterNode.getComponent(cc.Sprite).spriteFrame;
      characterItemNode.getComponent(Card)._cardId = ++CardManager.cardsId;
      characterItemNode.getComponent(Card).frontSprite = characterItemNode.getComponent(cc.Sprite).spriteFrame;
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
    let cardComp = monsterCard.getComponent(Card);
    cardComp._isAttackable = true;
    this.makeCardPreviewable(monsterCard);
  }

  static makeItemBuyable(itemCard: cc.Node, player: Player) {
    let cardComp = itemCard.getComponent(Card);
    cardComp._isBuyable = true;

    itemCard.off(cc.Node.EventType.TOUCH_START);
    this.makeCardPreviewable(itemCard);
  }

  static makeLootPlayable(lootCard: cc.Node, player: Player) {
    let cardComp = lootCard.getComponent(Card);
    cardComp._isPlayable = true;

    this.makeCardPreviewable(lootCard);
  }

  static makeItemActivateable(item: cc.Node) {
    let cardComp = item.getComponent(Card);
    let cardEffectComp = item.getComponent(CardEffect);
    cardComp._isActivateable = true;
    this.makeCardPreviewable(item);
  }

  static makeCardReactable(card: cc.Node, reactablePlayer: cc.Node) {
    let cardComp = card.getComponent(Card);
    let cardEffectComp = card.getComponent(CardEffect);
    if (cardEffectComp.testEffectsPreConditions()) {
      cardComp._isReactable = true;
      cardComp._cardHolderId = reactablePlayer.getComponent(Player).playerId
    }
    //change to show card preview.
    this.makeCardPreviewable(card);

  }

  static makeCardPreviewable(card: cc.Node) {

    card.off(cc.Node.EventType.TOUCH_START);
    card.on(
      cc.Node.EventType.TOUCH_START,
      () => {
        CardPreviewManager.getPreviews(Array.of(card))
        //cardPreview.showCardPreview2(card);
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

  static makeDeckNotDrawable(deck: cc.Node) {
    deck.off(cc.Node.EventType.TOUCH_START);
  }


  static disableCardActions(card: cc.Node) {
    card.off(cc.Node.EventType.TOUCH_START);
    if (card.getComponent(Deck) == null) {
      let cardComp = card.getComponent(Card);
      cardComp._isActivateable = false;
      cardComp._isAttackable = false;
      cardComp._isBuyable = false;
      cardComp._isPlayable = false;
      cardComp._isReactable = false;
      cardComp._isRequired = false;
      this.makeCardPreviewable(card);
    }
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

    this.disableCardActions(card);
    let cardComp;
    if (card.getComponent(Deck) == null) {
      cardComp = card.getComponent(Card);
    } else {
      cardComp = card.getComponent(Deck);
    }
    cardComp.isRequired = true;
    cardComp.requiredFor = dataCollector;


    ///change to show preview for comfirmation!
    this.makeCardPreviewable(card);

  }

  static unRequiredForDataCollector(card: cc.Node) {
    card.stopAllActions();
    card.runAction(cc.fadeTo(BLINKINGSPEED, 255));

    this.disableCardActions(card)
    card.off(cc.Node.EventType.TOUCH_START);
  }

  static requireLootPlay(cards: cc.Node[]) { }

  @printMethodStarted(COLORS.RED)
  static async getCardEffect(
    card: cc.Node,
    playerId: number,
    cardEffectIndex?: number
  ): Promise<ServerEffect> {
    let serverCardEffect;

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

    if (card.getComponent(Card) != null) {
      cardId = card.getComponent(Card)._cardId;
    } else {
      cardId = card.getComponent(Dice).diceId;
    }
    let cardPlayedData = {
      cardPlayerId: cardPlayerId,
      cardId: cardId
    };
    let serverCardEffect: ServerEffect;

    if (cardEffectIndex != null) {
      serverCardEffect = await card
        .getComponent(CardEffect)
        .getServerEffect(cardPlayedData, cardEffectIndex);
    } else {
      serverCardEffect = await card
        .getComponent(CardEffect)
        .getServerEffect(cardPlayedData);
    }
    let isDice = false;
    if (card.getComponent(Dice) != null) {
      isDice = true;
    }
    if (isDice) {
      cc.log('card activated is Dice')
    } else {
      switch (serverCardEffect.effctType) {
        case ITEM_TYPE.ACTIVE:
          switch (card.getComponent(Card).type) {
            case CARD_TYPE.CHAR:
              card.getComponent(Item).useItem();
              break;
            case CARD_TYPE.CHARITEM:
              card.getComponent(CharacterItem).useItem();
              break;
            case CARD_TYPE.LOOT:
              break;
            case CARD_TYPE.MONSTER:
              break;
            default:
              card.getComponent(Item).useItem();
              break;
          }
          break;
        case ITEM_TYPE.PASSIVE:
          cc.log('dont rotate for passive effect')
          break;
        case ITEM_TYPE.PAID:
          cc.log('dont rotate for paid effect')
          break;
        default:
          break;
      }
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
      player.deskCards.push(player.characterItem);
      player.deskCards.push(player.character);
      if (PlayerManager.mePlayer == player.node) {
        for (const handCard of player.handCards) {
          if (handCard.getComponent(Card)._isFlipped) {
            cc.log(`${handCard.name} is fliiped, flip it!`)
            cc.log(handCard.getComponent(Card))
            handCard.getComponent(Card).flipCard();
            cc.log(`${handCard.name} after flip`)
            cc.log(handCard.getComponent(Card))
          } else cc.log(`${handCard.name} is not flipped`)
        }
      }
    }
  }

  static activeMoveAnimations: { index: number, endBools: boolean[] }[] = []
  static moveAnimationIndex: number = 0;

  static async moveCardTo(card: cc.Node, placeToMove: cc.Node, sendToServer: boolean, moveIndex?: number, firstPos?) {
    let canvas = cc.find('Canvas')
    if (firstPos != null && sendToServer == false) {
      cc.log('test')
      card.setParent(canvas)
      card.setPosition(firstPos)
    }
    let originalPos = canvas.convertToNodeSpaceAR(card.parent.convertToWorldSpaceAR(card.getPosition()));
    let movePos = canvas.convertToNodeSpaceAR(placeToMove.parent.convertToWorldSpaceAR(placeToMove.getPosition()))
    card.setParent(canvas)
    card.setPosition(originalPos)
    let moveAction = cc.moveTo(TIMETODRAW, movePos);
    let animationIndex: number
    if (moveIndex == null || moveIndex == -1) {
      animationIndex = ++this.moveAnimationIndex
    } else {
      animationIndex = moveIndex
      this.moveAnimationIndex = moveIndex;
    }
    let bools: boolean[] = []
    let moveAnimation = { index: animationIndex, endBools: bools }
    cc.log(`added ${moveAnimation.index}`)
    this.activeMoveAnimations.push(moveAnimation)

    let placeId: number
    if (sendToServer) {
      if (placeToMove.name.includes('Hand')) {
        placeId = placeToMove.getComponent(CardLayout).playerId;
      } else {
        placeId = placeToMove.getComponent(Card)._cardId
      }
      let serverData = {
        signal: Signal.MOVECARD,
        srvData: { moveIndex: animationIndex, cardId: card.getComponent(Card)._cardId, placeID: placeId, firstPos: firstPos }
      };
      card.runAction(cc.spawn(moveAction, cc.callFunc(() => {
        Server.$.send(serverData.signal, serverData.srvData)
      }, this)))
      cc.log('b4 end of animation')
      await this.waitForMoveAnimationEnd(animationIndex)
      cc.log('after end of animation')
      return true
    } else {
      let serverData = {
        signal: Signal.MOVECARDEND,
        srvData: { moveIndex: animationIndex, cardId: card.getComponent(Card)._cardId }
      };
      if (moveIndex == null) {
        serverData.signal = Signal.MOVECARD
      }
      card.runAction(cc.sequence(moveAction, cc.callFunc(() => {
        Server.$.send(serverData.signal, serverData.srvData)
        this.removeMoveAnimation(animationIndex)
      }, this)))
      await this.waitForMoveAnimationEnd(animationIndex)
      return true
    }
  }


  static reciveMoveCardEnd(moveIndex: number) {
    cc.log(moveIndex)
    let moveAnim = this.activeMoveAnimations.find(moveAnim => {
      cc.log(moveAnim)
      if (moveAnim.index == moveIndex) {
        return true;
      }
    })
    cc.log(moveAnim)
    moveAnim.endBools.push(true)
    if (moveAnim.endBools.length == PlayerManager.players.length - 1) {
      this.removeMoveAnimation(moveIndex)
    }
  }

  static removeMoveAnimation(moveIndex: number) {
    this.activeMoveAnimations = this.activeMoveAnimations.filter((moveAnim) => {
      moveAnim.index != moveIndex
    })
    cc.log(`removed ${moveIndex}`)
  }

  static isMoveAnimationOver(moveIndex: number) {
    if (this.activeMoveAnimations.find(moveAnim => {
      if (moveAnim.index == moveIndex) {
        return true;
      }
    }) != null) {
      return false
    } else {
      return true
    }
  }

  static waitForMoveAnimationEnd(moveIndex: number) {
    return new Promise((resolve, reject) => {
      let check = () => {
        if (this.isMoveAnimationOver(moveIndex)) {
          resolve(true);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
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
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const player = PlayerManager.players[i].getComponent(Player);
      this.onTableCards = this.onTableCards.concat(player.deskCards);
    }
    for (const tableCard of this.onTableCards) {
      if (tableCard.getComponent(Card)._isFlipped) {
        tableCard.getComponent(Card).flipCard();
      }
    }
  }

  static updatePassiveListeners() {
    // PassiveManager.clearAllListeners();
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const player = PlayerManager.players[i].getComponent(Player);
      for (let j = 0; j < player.deskCards.length; j++) {
        const item = player.deskCards[j];
        PassiveManager.registerPassiveItem(item, true);
      }
      //PassiveManager.registerPassiveItem(player.characterItem);
    }
    MonsterField.updateActiveMonsters()

  }

  static moveCardToSoulsSpot(cardToMove: cc.Node, soulsLayout: cc.Node, sendToServer: boolean) {
    // let character = soulsLayout.children[0]
    let layoutPos = soulsLayout.parent.convertToWorldSpaceAR(soulsLayout.getPosition())
    let conv = cardToMove.convertToNodeSpaceAR(layoutPos)
    let action = (cc.moveTo(TIMETOBUY, conv))
    cardToMove.runAction(cc.sequence(action, cc.callFunc(() => {
      cardToMove.setParent(soulsLayout);
      let cardWidget = cardToMove.addComponent(cc.Widget)
      cardWidget.isAlignRight = true;
      cardWidget.right = 0;

      let monsterComp = cardToMove.getComponent(Monster)
      return new Promise((resolve, reject) => {
        resolve(true)
      })
    }, this)))
    // setTimeout(() => {
    // }, TIMETOBUY + 0.1 * 1000);

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
      let cardComp: Card = cardNode.getComponent(Card);
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

    return otherPlayersHandCards;
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    CardManager.lootDeck = cc.find("Canvas/LootDeck");
    CardManager.monsterDeck = cc.find("Canvas/MonsterDeck");
    CardManager.treasureDeck = cc.find("Canvas/TreasureDeck");
  }

  start() { }

  // update (dt) {}
}
