import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { BLINKING_SPEED, CARD_TYPE, TIME_TO_BUY, TIME_TO_DRAW, GAME_EVENTS } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import { CardLayout } from "../Entites/CardLayout";
import Character from "../Entites/CardTypes/Character";
import Monster from "../Entites/CardTypes/Monster";
import Card from "../Entites/GameEntities/Card";
import Deck from "../Entites/GameEntities/Deck";
import Dice from "../Entites/GameEntities/Dice";
import Player from "../Entites/GameEntities/Player";
import Store from "../Entites/GameEntities/Store";
import MonsterCardHolder from "../Entites/MonsterCardHolder";
import MonsterField from "../Entites/MonsterField";
import Pile from "../Entites/Pile";
import PlayerDesk from "../Entites/PlayerDesk";
import { ServerEffect } from "../Entites/ServerCardEffect";
import Stack from "../Entites/Stack";
import RefillEmptySlot from "../StackEffects/Refill Empty Slot";
import CardPreviewManager from "./CardPreviewManager";
import PassiveManager from "./PassiveManager";
import PileManager from "./PileManager";
import PlayerManager from "./PlayerManager";
import TurnsManager from "./TurnsManager";
import Item from "../Entites/CardTypes/Item";
import { Logger } from "../Entites/Logger";



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

  static monsterField: cc.Node = null

  static store: cc.Node = null;

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
            cc.loader.loadResDir('Prefabs/LootCards', cc.Prefab, (err, rsc, urls) => {
              CardManager.lootDeck.getComponent(Deck).cardsPrefab.push(...rsc)
              cc.loader.loadResDir('Prefabs/TreasureCards', cc.Prefab, (err, rsc, urls) => {
                CardManager.treasureDeck.getComponent(Deck).cardsPrefab.push(...rsc)
                whevent.emit(GAME_EVENTS.CARD_MANAGER_LOAD_PREFAB)
                // CardManager.prefabLoaded = true;
              })
            })
          }
        );
      });
    });

    let loaded = await this.waitForPrefabLoad();
    return loaded;
  }

  static async waitForPrefabLoad(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.CARD_MANAGER_LOAD_PREFAB, () => {
        resolve(true);
      })

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
    return serverEffectStack
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
        //let over = await this.waitForCheck()
        return
      }
      cc.log(`check for empty fields`)
      this.isCheckingForEmptyFields = true;

      let monsterField = this.monsterField.getComponent(MonsterField)
      MonsterField.updateActiveMonsters();
      cc.log(MonsterField.activeMonsters.map(monster => monster.name))
      if (monsterField.maxNumOfMonsters > MonsterField.activeMonsters.length) {
        let emptyHolders = MonsterField.monsterCardHolders.filter(
          holder => holder.getComponent(MonsterCardHolder).monsters.length == 0
        );
        for (let i = 0; i < emptyHolders.length; i++) {
          const holder = emptyHolders[i];
          let refillEmptySlot = new RefillEmptySlot(PlayerManager.mePlayer.getComponent(Player).character.getComponent(Card)._cardId, holder.node, CARD_TYPE.MONSTER)
          await Stack.addToStack(refillEmptySlot, true)
          // let newMonster = this.monsterDeck.getComponent(Deck).drawCard(true)
          // let over = await holder.getComponent(MonsterCardHolder).addToMonsters(newMonster, true) 
        }
      }

      cc.log(`store cards ${Store.storeCards.length}`)
      if (Store.storeCards.length < Store.maxNumOfItems) {
        let diff = Store.maxNumOfItems - Store.storeCards.length;
        for (let i = 0; i < diff; i++) {
          let refillEmptySlot = new RefillEmptySlot(PlayerManager.mePlayer.getComponent(Player).character.getComponent(Card)._cardId, Store.$.node, CARD_TYPE.TREASURE)
          await Stack.addToStack(refillEmptySlot, true)
          //Store.$.addStoreCard(true);
        }

      }
      this.isCheckingForEmptyFields = false;
    }
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
      const dice = PlayerManager.dice[i]
      if (dice.getComponent(Dice).diceId == cardId) {
        return dice;
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

    //  if (includeInDecksCards) {
    for (let i = 0; i < this.inDecksCards.length; i++) {
      const inDeckCard = this.inDecksCards[i].getComponent(Card);

      if (inDeckCard._cardId == cardId) {
        return inDeckCard.node;
      }
    }
    // }
    cc.error(`no card found for id ${cardId}`)
    return null;

  }

  static getCardByName(name: string) {
    let regEx: RegExp = new RegExp(name, 'i')
    for (let i = 0; i < CardManager.allCards.length; i++) {
      const card: Card = CardManager.allCards[i].getComponent(Card);
      if (card.name.search(regEx) != -1) {
        return card.node;
      }
    }


    for (let i = 0; i < PlayerManager.players.map(player => player.getComponent(Player)).length; i++) {
      const player = PlayerManager.players.map(player => player.getComponent(Player))[i];
      for (let j = 0; j < player.deskCards.length; j++) {
        const card = player.deskCards[j].getComponent(Card);
        if (card.name.search(regEx) != -1) {
          return card.node;
        }
      }
      for (let j = 0; j < player.handCards.length; j++) {
        const card = player.handCards[j].getComponent(Card);
        if (card.name.search(regEx) != -1) {
          return card.node;
        }
      }
      for (let j = 0; j < player.activeItems.length; j++) {
        const card = player.activeItems[j].getComponent(Card);
        if (card.name.search(regEx) != -1) {
          return card.node;
        }
      }
    }

    for (let i = 0; i < this.inDecksCards.length; i++) {
      const inDeckCard = this.inDecksCards[i].getComponent(Card);

      if (inDeckCard.name.search(regEx) != -1) {
        return inDeckCard.node;
      }
    }

    cc.error(`no card found`)
    return null;
  }

  static makeDeckCards(deck: Deck) {
    deck._cardId = ++this.cardsId
    deck.node.getComponent(Card)._cardId = ++this.cardsId
    let cardsToBeMade: cc.Prefab[] = deck.cardsPrefab;
    for (let i = 0; i < cardsToBeMade.length; i++) {
      let newCard: cc.Node = cc.instantiate(cardsToBeMade[i]);

      let cardComp: Card = newCard.getComponent(Card);
      newCard.getComponent(Card).frontSprite = newCard.getComponent(cc.Sprite).spriteFrame;
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


      cardComp.flipCard(false);
      deck.addToDeckOnTop(newCard, false);
    }

    // if (deck.suffleInTheStart) deck.shuffleDeck();

  }


  static makeCharDeck() {
    let characterNode: cc.Node;
    let characterItemNode: cc.Node;

    for (let j = 0; j < CardManager.charCardsPrefabs.length; j++) {
      characterNode = cc.instantiate(CardManager.charCardsPrefabs[j]);
      if (characterNode.getComponent(Character).charItemPrefab) {
        characterItemNode = cc.instantiate(
          characterNode.getComponent(Character).charItemPrefab
        );
      }
      characterNode.getComponent(Card)._cardId = ++CardManager.cardsId;
      characterNode.getComponent(Card).frontSprite = characterNode.getComponent(cc.Sprite).spriteFrame;
      if (characterItemNode) {
        characterItemNode.getComponent(Card)._cardId = ++CardManager.cardsId;
        characterItemNode.getComponent(Card).frontSprite = characterItemNode.getComponent(cc.Sprite).spriteFrame;
        characterItemNode.parent = cc.director.getScene();
      }
      let fullCharCards: { char: cc.Node; item: cc.Node } = {
        char: characterNode,
        item: characterItemNode
      };
      characterNode.parent = cc.director.getScene();
      CardManager.characterDeck.push(fullCharCards);
      CardManager.allCards.push(fullCharCards.char)
      if (fullCharCards.item) {
        CardManager.allCards.push(fullCharCards.item)
      }
      //CardManager.characterItemDeck.put(characterItemNode)
    }
  }

  static makeMonsterAttackable(monsterCard: cc.Node) {
    let cardComp = monsterCard.getComponent(Card);
    if (!cardComp._isAttackable) {
      cardComp._hasEventsBeenModified = true;
    }
    cardComp._isAttackable = true;
    this.makeCardPreviewable(monsterCard);
  }

  static makeItemBuyable(itemCard: cc.Node, player: Player) {
    let cardComp = itemCard.getComponent(Card);
    if (!cardComp._isBuyable) {
      cardComp._hasEventsBeenModified = true;
    }
    cardComp._isBuyable = true;
    itemCard.off(cc.Node.EventType.TOUCH_START);
    this.makeCardPreviewable(itemCard);
  }

  static makeLootPlayable(lootCard: cc.Node, player: Player) {
    let cardComp = lootCard.getComponent(Card);
    if (!cardComp._isPlayable) {
      cardComp._hasEventsBeenModified = true;
    }
    cardComp._isPlayable = true;
    this.makeCardPreviewable(lootCard);
  }

  static makeItemActivateable(item: cc.Node) {
    let cardComp = item.getComponent(Card);
    let cardEffectComp = item.getComponent(CardEffect);
    if (!cardComp._isActivateable) {
      cardComp._hasEventsBeenModified = true;
    }
    cardComp._isActivateable = true;
    this.makeCardPreviewable(item);
  }

  static makeCardReactable(card: cc.Node, reactablePlayer: cc.Node) {
    let cardComp = card.getComponent(Card);
    let cardEffectComp = card.getComponent(CardEffect);
    try {
      if (cardEffectComp.testEffectsPreConditions()) {
        if (!cardComp._isReactable) {
          cardComp._hasEventsBeenModified = true;
        }
        cardComp._isReactable = true;
        cardComp._cardHolderId = reactablePlayer.getComponent(Player).playerId
      }
    } catch (error) {
      cc.error(error)
      Logger.error(error)
    }
    //change to show card preview.
    this.makeCardPreviewable(card);

  }

  static makeCardPreviewable(card: cc.Node) {

    card.off(cc.Node.EventType.TOUCH_START);
    card.on(
      cc.Node.EventType.TOUCH_START,
      () => {
        cc.log(`${card.name} was pressed, get previews`)
        CardPreviewManager.getPreviews(Array.of(card), true)
        //cardPreview.showCardPreview2(card);
      },
      this
    );
    try {
      CardPreviewManager.updatePreviewsEvents()
    } catch (error) {
      cc.error(error)
      Logger.error(error)
    }
  }



  static disableCardActions(card: cc.Node) {
    card.off(cc.Node.EventType.TOUCH_START);
    if (card.getComponent(Deck) == null) {
      let cardComp = card.getComponent(Card);
      if (cardComp._isActivateable || cardComp._isAttackable || cardComp._isBuyable || cardComp._isPlayable || cardComp._isReactable || cardComp._isRequired) {
        cardComp._hasEventsBeenModified = true
      }
      cardComp._isActivateable = false;
      cardComp._isAttackable = false;
      cardComp._isBuyable = false;
      cardComp._isPlayable = false;
      cardComp._isReactable = false;
      cardComp._isRequired = false;
      cardComp._requiredFor = null;
      this.makeCardPreviewable(card);
    } else {
      let comp = card.getComponent(Deck).topBlankCard.getComponent(Card)
      if (comp._isActivateable || comp._isAttackable || comp._isBuyable || comp._isPlayable || comp._isReactable || comp._isRequired) {
        comp._hasEventsBeenModified = true
      }
      comp._isActivateable = false;
      comp._isAttackable = false;
      comp._isBuyable = false;
      comp._isPlayable = false;
      comp._isReactable = false;
      comp._isRequired = false;
      comp._requiredFor = null;
      this.makeCardPreviewable(card);
    }
  }

  static makeRequiredForDataCollector(
    dataCollector: DataCollector,
    card: cc.Node
  ) {
    cc.log(`make ${card.name} required `)

    let p = card.getComponentInChildren(cc.ParticleSystem);
    p.resetSystem()
    cc.log(`particle sys of ${card.name}`)
    cc.log(p)

    // card.runAction(
    //   cc
    //     .sequence(cc.fadeTo(BLINKING_SPEED, 50), cc.fadeTo(BLINKING_SPEED, 255))
    //     .repeatForever()
    // );

    this.disableCardActions(card);
    if (card.getComponent(Deck) == null) {

      let cardComp = card.getComponent(Card);
      if (!cardComp._isRequired) {
        cardComp._hasEventsBeenModified = true;
      }
      cardComp._isRequired = true;
      cardComp._requiredFor = dataCollector;
    } else {
      let deckComp = card.getComponent(Deck);
      deckComp.topBlankCard.off(cc.Node.EventType.TOUCH_START)
      if (!deckComp._isRequired) {
        deckComp._hasEventsBeenModified = true;
      }
      deckComp._isRequired = true;
      deckComp._requiredFor = dataCollector;
    }

    ///change to show preview for comfirmation!
    // CardPreviewManager.addPreview(card) 
    this.makeCardPreviewable(card);



  }

  static unRequiredForDataCollector(card: cc.Node) {
    cc.log(`un require for ${card.name}`)
    card.stopAllActions();
    card.runAction(cc.fadeTo(BLINKING_SPEED, 255));
    let p = card.getComponentInChildren(cc.ParticleSystem);
    p.stopSystem();

    let cardPreview = CardPreviewManager.getPreviewByCard(card)
    if (cardPreview != null) {
      CardPreviewManager.removeFromCurrentPreviews(Array.of(card))
      // CardPreviewManager.removeFromCurrentPreviews(Array.of(cardPreview.node))
    }
    this.disableCardActions(card)
    card.off(cc.Node.EventType.TOUCH_START);
  }

  static requireLootPlay(cards: cc.Node[]) { }

  /**
   * 
   * @param card card to get the owner of
   * @returns character if owned by player, monster card if not.
   */
  static getCardOwner(card: cc.Node) {
    let owner: cc.Node
    let player = PlayerManager.getPlayerByCard(card)
    if (player) {
      owner = player.character;
    } else if (card.getComponent(Monster)) {
      owner = card
    } else if (card.getComponent(Item)) {
      owner = card.getComponent(Item).lastOwnedBy.character
    } else owner = null
    return owner;
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
            handCard.getComponent(Card).flipCard(false);
          }
        }
      }
    }
  }

  static activeMoveAnimations: { index: number, endBools: boolean[] }[] = []
  static moveAnimationIndex: number = 0;

  static async moveCardTo(card: cc.Node, placeToMove: cc.Node, sendToServer: boolean, flipIfFlipped: boolean, moveIndex?: number, firstPos?, playerId?: number) {

    let canvas = cc.find('Canvas')
    if (firstPos != null && sendToServer == false) {
      card.setParent(canvas)
      card.setPosition(firstPos)
    }


    //only for test!

    if (card.parent == null) {
      card.parent = canvas
    }


    cc.log(`place to move to is: ${placeToMove.name}, its parent is ${placeToMove.parent.name} `)

    let originalPos = canvas.convertToNodeSpaceAR(card.parent.convertToWorldSpaceAR(card.getPosition()));
    let movePos = canvas.convertToNodeSpaceAR(placeToMove.parent.convertToWorldSpaceAR(placeToMove.getPosition()))
    let moveAction = cc.moveTo(TIME_TO_DRAW, movePos);
    let animationIndex: number
    if (moveIndex == null || moveIndex == -1) {
      animationIndex = ++this.moveAnimationIndex
    } else {
      animationIndex = moveIndex
      this.moveAnimationIndex = moveIndex;
    }

    let bools: boolean[] = []
    let moveAnimation = { index: animationIndex, endBools: bools }
    this.activeMoveAnimations.push(moveAnimation)
    let placeId: number

    if (sendToServer == true) {
      if (placeToMove.name.includes('Hand')) {
        placeId = placeToMove.getComponent(CardLayout).playerId;
      } else if (placeToMove.name.includes('Desk')) {
        placeId = placeToMove.getComponent(PlayerDesk)._playerId
      } else {
        placeId = placeToMove.getComponent(Card)._cardId
      }
      let serverData = {
        signal: Signal.MOVE_CARD,
        srvData: { moveIndex: animationIndex, cardId: card.getComponent(Card)._cardId, placeID: placeId, flipIfFlipped: flipIfFlipped, firstPos: firstPos, playerId: PlayerManager.mePlayer.getComponent(Player).playerId }
      };
      card.runAction(cc.spawn(moveAction, cc.callFunc(() => {
        ServerClient.$.send(serverData.signal, serverData.srvData)
      }, this)))

      await this.waitForMoveAnimationEnd(animationIndex)
      if (flipIfFlipped && card.getComponent(Card)._isFlipped) {
        await card.getComponent(Card).flipCard(false)
      }
      return true
    } else {
      let serverData = {
        signal: Signal.MOVE_CARD_END,
        srvData: { moveIndex: animationIndex, cardId: card.getComponent(Card)._cardId, flipIfFlipped: flipIfFlipped, playerId: playerId }
      };
      if (moveIndex == null) {
        serverData.signal = Signal.MOVE_CARD
      }
      card.runAction(cc.sequence(moveAction, cc.callFunc(() => {
        ServerClient.$.send(serverData.signal, serverData.srvData)
        this.removeMoveAnimation(animationIndex)
      }, this)))
      await this.waitForMoveAnimationEnd(animationIndex)
      if (flipIfFlipped && card.getComponent(Card)._isFlipped) {
        await card.getComponent(Card).flipCard(false)
      }
      return true
    }
  }


  static receiveMoveCardEnd(moveIndex: number) {
    let moveAnim = this.activeMoveAnimations.find(moveAnim => {
      if (moveAnim.index == moveIndex) {
        return true;
      }
    })
    moveAnim.endBools.push(true)
    if (moveAnim.endBools.length == PlayerManager.players.length - 1) {
      this.removeMoveAnimation(moveIndex)
    }
  }

  static removeMoveAnimation(moveIndex: number) {
    this.activeMoveAnimations = this.activeMoveAnimations.filter((moveAnim) => {
      moveAnim.index != moveIndex
    })
    whevent.emit(GAME_EVENTS.CARD_MANAGER_MOVE_ANIM_END, moveIndex)
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
      whevent.on(GAME_EVENTS.CARD_MANAGER_MOVE_ANIM_END, (params) => {
        if (params == moveIndex) {
          resolve(true)
        }
      })
    });
  }

  static updateOnTableCards() {
    this.onTableCards = [];
    if (PileManager.lootCardPile != null) {
      this.onTableCards = this.onTableCards.concat(
        Store.storeCards,
        MonsterField.activeMonsters,
        PileManager.lootCardPile.getCards(),
        PileManager.treasureCardPile.getCards(),
        PileManager.monsterCardPile.getCards()
      );

    } else {
      let lootPile = cc.find("Canvas/LootCardPile").getComponent(Pile)
      let treasurePile = cc.find("Canvas/TreasureCardPile").getComponent(Pile)
      let monsterPile = cc.find("Canvas/MonsterCardPile").getComponent(Pile)

      this.onTableCards = this.onTableCards.concat(
        Store.storeCards,
        MonsterField.activeMonsters,
        lootPile.getCards(),
        treasurePile.getCards(),
        monsterPile.getCards()
      );
    }

    for (let i = 0; i < PlayerManager.players.length; i++) {
      const player = PlayerManager.players[i].getComponent(Player);
      this.onTableCards = this.onTableCards.concat(player.deskCards);
    }
    for (const tableCard of this.onTableCards) {
      if (tableCard.getComponent(Card)._isFlipped) {
        tableCard.getComponent(Card).flipCard(false);
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
    let action = (cc.moveTo(TIME_TO_BUY, conv))
    cardToMove.runAction(cc.sequence(action, cc.callFunc(() => {
      cardToMove.setParent(soulsLayout);
      let cardWidget = cardToMove.addComponent(cc.Widget)
      cardWidget.isAlignRight = true;
      cardWidget.right = 0;

      let monsterComp = cardToMove.getComponent(Monster)
      return true
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

    for (let i = 0; i < PlayerManager.players.length; i++) {
      const otherPlayer = PlayerManager.players[i].getComponent(Player);
      if (player.getComponent(Player).playerId != otherPlayer.playerId)
        otherPlayersHandCards.concat(otherPlayer.handCards);
    }

    return otherPlayersHandCards;
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    CardManager.lootDeck = cc.find("Canvas/LootDeck");
    CardManager.monsterDeck = cc.find("Canvas/MonsterDeck");
    CardManager.treasureDeck = cc.find("Canvas/TreasureDeck");
    CardManager.store = cc.find("Canvas/Store");
    CardManager.monsterField = cc.find("Canvas/MonsterField");
  }

  start() { }

  // update (dt) {}
}
