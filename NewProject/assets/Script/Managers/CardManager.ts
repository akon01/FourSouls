import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { CARD_TYPE, GAME_EVENTS, ITEM_TYPE, PARTICLE_TYPES, TIME_TO_DRAW } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import { CardLayout } from "../Entites/CardLayout";
import Character from "../Entites/CardTypes/Character";
import Item from "../Entites/CardTypes/Item";
import Monster from "../Entites/CardTypes/Monster";
import Card from "../Entites/GameEntities/Card";
import Deck from "../Entites/GameEntities/Deck";
import Dice from "../Entites/GameEntities/Dice";
import Player from "../Entites/GameEntities/Player";
import Store from "../Entites/GameEntities/Store";
import { Logger } from "../Entites/Logger";
import MonsterField from "../Entites/MonsterField";
import Pile from "../Entites/Pile";
import PlayerDesk from "../Entites/PlayerDesk";
import AnimationManager, { ANIM_COLORS } from "./Animation Manager";
import CardPreviewManager from "./CardPreviewManager";
import ParticleManager from "./ParticleManager";
import PileManager from "./PileManager";
import PlayerManager from "./PlayerManager";
import { whevent } from "../../ServerClient/whevent";
import TurnsManager from "./TurnsManager";
import PassiveManager from "./PassiveManager";
import { CardSet } from "../Entites/Card Set";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardManager extends cc.Component {
  static cardsId: number = 0;

  static onTableCards: cc.Node[] = [];

  static inDecksCards: cc.Node[] = [];

  static allCards: CardSet = new CardSet()

  static allPlayers: cc.Node[] = [];

  static currentPlayer: cc.Node = null;

  static previewOnlyCards: cc.Node[] = [];

  static interactableCards: cc.Node[] = [];

  static lootDeck: cc.Node = null;

  static monsterDeck: cc.Node = null;

  static monsterField: cc.Node = null

  static store: cc.Node = null;

  static treasureDeck: cc.Node = null;

  static bonusDeck: cc.Node = null

  static characterDeck: Array<{ char: cc.Node; item: cc.Node }> = [];

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

  @property(cc.Node)
  onTableCardsHolder: cc.Node = null;

  @property(cc.Prefab)
  animationNode: cc.Prefab = null

  @property(cc.Prefab)
  cardSpritesPrefab: cc.Prefab = null

  @property(cc.Prefab)
  effectCounterPrefab: cc.Prefab = null



  static effectCounter: cc.Node = null;

  static $: CardManager = null

  static async init() {
    this.effectCounter = cc.instantiate(this.$.effectCounterPrefab)
    this.bonusDeck.active = false
    cc.log(`start prefab Load`)
    const loaded = await this.preLoadPrefabs();
    cc.log(`end prefab Load`)
    // CardManager.CharItemCardPool = new cc.NodePool();
    // CardManager.extraSoulsCardPool = new cc.NodePool();
    // CardManager.lootCardPool = new cc.NodePool();
    // CardManager.charCardPool = new cc.NodePool();
    // CardManager.monsterCardPool = new cc.NodePool();
    // CardManager.treasureCardPool = new cc.NodePool();

    const lootDeckComp: Deck = CardManager.lootDeck.getComponent(Deck);
    const treasureDeckComp: Deck = CardManager.treasureDeck.getComponent(Deck);
    const monsterDeckComp: Deck = CardManager.monsterDeck.getComponent(Deck);
    const bonusSouls: Deck = CardManager.bonusDeck.getComponent(Deck)

    const decks: Deck[] = [lootDeckComp, treasureDeckComp, monsterDeckComp, bonusSouls];

    // for (let i = 0; i < decks.length; i++) {
    //   const deck = decks[i];
    //   this.makeDeckCards(deck);
    // }

    // this.makeCharDeck();
    this.sendCardInfoToServer()

    cc.resources.release("Sprites/CardBacks", cc.Prefab)



    return true
  }

  static sendCardInfoToServer() {
    const allCards = this.allCards.getCards()
    const cardMap = []
    allCards.forEach(card => {
      cardMap.push({ cardId: card.getComponent(Card)._cardId, cardName: card.getComponent(Card).cardName })
    })
    ServerClient.$.send(Signal.SEND_CARD_DATA, { allCards: JSON.stringify(cardMap) })
  }

  static async registerBonusSouls() {
    const cards = CardManager.bonusDeck.getComponent(Deck)._cards.getCards()
    for (const card of cards) {
      await PassiveManager.registerPassiveItem(card, true)
    }
  }

  static async preLoadPrefabs() {
    cc.resources.loadDir("Prefabs/CharacterCards/CharCardsPrefabs", function (
      err,
      rsc,
    ) {
      if (err) {
        cc.log(err)
        cc.log(rsc)
      }
      for (let i = 0; i < rsc.length; i++) {
        const prefab = rsc[i];
        CardManager.charCardsPrefabs.push(prefab);
      }
      cc.resources.loadDir("Prefabs/CharacterCards/CharItemCards", function (
        err,
        rsc,
      ) {
        if (err) {
          cc.log(err)
          cc.log(rsc)
        }
        for (let i = 0; i < rsc.length; i++) {
          const prefab = rsc[i];
          CardManager.charItemCardsPrefabs.push(prefab);
        }
        CardManager.makeCharDeck()
        cc.resources.release("Prefabs/CharacterCards/CharCardsPrefabs", cc.Prefab)
        cc.resources.release("Prefabs/CharacterCards/CharItemCards", cc.Prefab)
        CardManager.charCardsPrefabs = []
        CardManager.charItemCardsPrefabs = []
        cc.resources.loadDir<cc.SpriteFrame>(
          "Sprites/CardBacks",
          cc.SpriteFrame,
          (err, rsc) => {
            if (err) {
              cc.log(err)
              cc.log(rsc)
            }
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
            cc.resources.loadDir<cc.Prefab>("Prefabs/LootCards", cc.Prefab, (err, rsc) => {
              if (err) {
                cc.log(err)
              }
              CardManager.lootDeck.getComponent(Deck).cardsPrefab.push(...rsc)
              CardManager.makeDeckCards(CardManager.lootDeck.getComponent(Deck))
              CardManager.lootDeck.getComponent(Deck)._cards.getCards().forEach(card => {
                if (card.getComponent(Card).type != CARD_TYPE.LOOT) {
                  cc.error(`card ${card.name} is in loot deck, should not be here!`)
                }
              });
              cc.resources.release("Prefabs/LootCards", cc.Prefab)
              cc.resources.loadDir<cc.Prefab>("Prefabs/TreasureCards", cc.Prefab, (err, rsc) => {
                if (err) {
                  cc.log(err)
                  cc.log(rsc)
                }
                CardManager.treasureDeck.getComponent(Deck).cardsPrefab.push(...rsc)
                CardManager.makeDeckCards(CardManager.treasureDeck.getComponent(Deck))
                CardManager.treasureDeck.getComponent(Deck)._cards.getCards().forEach(card => {
                  if (card.getComponent(Card).type != CARD_TYPE.TREASURE) {
                    cc.error(`card ${card.name} is in treausre deck, should not be here!`)
                  }
                })
                cc.resources.release("Prefabs/TreasureCards", cc.Prefab)
                cc.resources.loadDir<cc.Prefab>("Prefabs/Complete Monster Cards", cc.Prefab, (err, rsc) => {
                  if (err) {
                    cc.log(err)
                    cc.log(rsc)
                  }
                  CardManager.monsterDeck.getComponent(Deck).cardsPrefab.push(...rsc)
                  CardManager.makeDeckCards(CardManager.monsterDeck.getComponent(Deck))
                  CardManager.monsterDeck.getComponent(Deck)._cards.getCards().forEach(card => {
                    if (card.getComponent(Card).type != CARD_TYPE.MONSTER) {
                      cc.error(`card ${card.name} is in monster deck, should not be here!`)
                    }
                  })
                  cc.resources.release("Prefabs/Complete Monster Cards", cc.Prefab)
                  cc.resources.loadDir<cc.Prefab>("Prefabs/Bonus Souls", cc.Prefab, (err, rsc) => {
                    if (err) {
                      throw err
                    }
                    cc.resources.release("Prefabs/Bonus Souls", cc.Prefab)
                    CardManager.bonusDeck.getComponent(Deck).cardsPrefab.push(...rsc)
                    CardManager.makeDeckCards(CardManager.bonusDeck.getComponent(Deck))
                    cc.resources.release("Prefabs/Bonus Souls", cc.Prefab)
                    cc.log(`end bonus`)
                    whevent.emit(GAME_EVENTS.CARD_MANAGER_LOAD_PREFAB)
                  })
                  // CardManager.prefabLoaded = true;
                })
              })
            })
          }
        );
      });
    });

    const loaded = await this.waitForPrefabLoad();
    return loaded;
  }

  static async waitForPrefabLoad(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.CARD_MANAGER_LOAD_PREFAB, () => {
        resolve(true);
      })

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
    throw new Error(`No deck found with type ${deckType}`)
  }

  static isCheckingForEmptyFields: boolean = false;


  /**
   * Search in allCards and Decks for a matching card/Deck
   * @param cardId a card id to get from all cards
   */
  static getCardById(cardId: number, includeInDecksCards?: boolean): cc.Node {
    for (let i = 0; i < CardManager.allCards.length; i++) {
      const card: Card = CardManager.allCards.getCards()[i].getComponent(Card);
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
        if (deck.node.getComponent(Card)._cardId == cardId) {
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
      for (let j = 0; j < player.passiveItems.length; j++) {
        const card = player.passiveItems[j].getComponent(Card);
        if (card._cardId == cardId) {
          return card.node;
        }
      }
      for (let j = 0; j < player.paidItems.length; j++) {
        const card = player.paidItems[j].getComponent(Card);
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
    throw new Error(`No card found with id ${cardId}`)

  }

  static getCardByName(name: string) {
    const regEx: RegExp = new RegExp(name, "i")
    for (let i = 0; i < CardManager.allCards.length; i++) {
      const card: Card = CardManager.allCards.getCards()[i].getComponent(Card);
      if (card.cardName.search(regEx) != -1) {
        return card.node;
      }
    }

    for (let i = 0; i < PlayerManager.players.map(player => player.getComponent(Player)).length; i++) {
      const player = PlayerManager.players.map(player => player.getComponent(Player))[i];
      for (let j = 0; j < player.deskCards.length; j++) {
        const card = player.deskCards[j].getComponent(Card);
        if (card.cardName.search(regEx) != -1) {
          return card.node;
        }
      }
      for (let j = 0; j < player.handCards.length; j++) {
        const card = player.handCards[j].getComponent(Card);
        if (card.cardName.search(regEx) != -1) {
          return card.node;
        }
      }
      for (let j = 0; j < player.activeItems.length; j++) {
        const card = player.activeItems[j].getComponent(Card);
        if (card.cardName.search(regEx) != -1) {
          return card.node;
        }
      }
      for (let j = 0; j < player.passiveItems.length; j++) {
        const card = player.passiveItems[j].getComponent(Card);
        if (card.cardName.search(regEx) != -1) {
          return card.node;
        }
      }
      for (let j = 0; j < player.paidItems.length; j++) {
        const card = player.paidItems[j].getComponent(Card);
        if (card.cardName.search(regEx) != -1) {
          return card.node;
        }
      }
    }

    for (let i = 0; i < this.inDecksCards.length; i++) {
      const inDeckCard = this.inDecksCards[i].getComponent(Card);

      if (inDeckCard.cardName.search(regEx) != -1) {
        return inDeckCard.node;
      }
    }

    cc.error(`no card found`)
    return null;
  }

  static addCardToDeck(card: cc.Node, deck: Deck) {
    const cardComp: Card = card.getComponent(Card);
    switch (deck.deckType) {
      case CARD_TYPE.LOOT:
        cardComp.backSprite = CardManager.lootCardBack;
        //     CardManager.lootCardPool.put(card);
        break;
      case CARD_TYPE.MONSTER:
        cardComp.backSprite = CardManager.monsterCardBack;

        break;
      case CARD_TYPE.TREASURE:
        cardComp.backSprite = CardManager.treasureCardBack;
        //    CardManager.treasureCardPool.put(card);
        break;
      case CARD_TYPE.BONUS_SOULS:
        cardComp.backSprite = CardManager.extraSoulsBack;
        //    CardManager.treasureCardPool.put(card);
        break;
      default:
        break;
    }
    //   if (deck._cardId == -1) {

    //      deck._cardId = ++CardManager.cardsId;
    // }
    cardComp._cardId = ++CardManager.cardsId;

    cardComp.flipCard(false);
    deck.addToDeckOnTop(card, false);
  }



  static makeDeckCards(deck: Deck) {
    deck._cardId = ++this.cardsId
    deck.node.getComponent(Card)._cardId = deck._cardId
    const cardsToBeMade: cc.Prefab[] = deck.cardsPrefab;
    // AnimationManager.addAnimationNode(deck.node)
    for (let i = 0; i < cardsToBeMade.length; i++) {
      const newCard: cc.Node = cc.instantiate(cardsToBeMade[i]);

      const cardComp: Card = newCard.getComponent(Card);
      if (cardComp.doNotMake) {
        newCard.destroy()
        continue
      }
      newCard.getComponent(Card).frontSprite = newCard.getComponent(cc.Sprite).spriteFrame;
      newCard.getComponent(Card).setSprites()
      if (cardComp.hasCounter) {

        cardComp.addCountLable()
      }

      // AnimationManager.addAnimationNode(newCard)
      this.addCardToDeck(newCard, deck)
      this.allCards.push(newCard)
      if (cardComp.makeMultiCards) {
        for (let j = 0; j < cardComp.numOfCopies; j++) {
          const copyCard = cc.instantiate(newCard);
          //  copyCard.getComponent(Card).setSprites()
          if (cardComp.copiesSprites[j]) {
            copyCard.getComponent(Card).frontSprite = cardComp.copiesSprites[j]
          } else {
            copyCard.getComponent(Card).frontSprite = newCard.getComponent(Card).frontSprite
          }
          if (cardComp.hasCounter) {
            cardComp.addCountLable()
          }

          copyCard.name = cardComp.node.name + `(${j})`
          copyCard.getComponent(Card).cardName = cardComp.cardName + `(${j})`
          this.addCardToDeck(copyCard, deck)
          this.allCards.push(copyCard)
        }
      }
    }
    deck.node.getComponent(Card).setSprites()
    deck.cardsPrefab = [];
  }

  static makeCharDeck() {
    let characterNode: cc.Node;
    let characterItemNode: cc.Node;

    for (let j = 0; j < CardManager.charCardsPrefabs.length; j++) {
      characterNode = cc.instantiate(CardManager.charCardsPrefabs[j]);
      //   AnimationManager.addAnimationNode(characterNode)
      if (characterNode.getComponent(Character).charItemPrefab) {
        characterItemNode = cc.instantiate(
          characterNode.getComponent(Character).charItemPrefab
        );
        //  AnimationManager.addAnimationNode(characterItemNode)
      }
      characterNode.getComponent(Card).setSprites()
      characterNode.getComponent(Card)._cardId = ++CardManager.cardsId;
      characterNode.getComponent(Card).frontSprite = characterNode.getComponent(cc.Sprite).spriteFrame;
      if (characterItemNode) {
        characterItemNode.getComponent(Card).setSprites()
        characterItemNode.getComponent(Card)._cardId = ++CardManager.cardsId;
        characterItemNode.getComponent(Card).frontSprite = characterItemNode.getComponent(cc.Sprite).spriteFrame;
        // characterItemNode.parent = cc.director.getScene();
      }
      const fullCharCards: { char: cc.Node; item: cc.Node } = {
        char: characterNode,
        item: characterItemNode
      };
      //characterNode.parent = cc.director.getScene();
      CardManager.characterDeck.push(fullCharCards);
      CardManager.allCards.push(fullCharCards.char)
      if (fullCharCards.item) {
        CardManager.allCards.push(fullCharCards.item)
      }
      // CardManager.characterItemDeck.put(characterItemNode)
    }
  }

  static checkIfIAmTurnPlayer() {
    const me = PlayerManager.mePlayer.getComponent(Player)
    const turnPlayer = TurnsManager.getCurrentTurn().getTurnPlayer();
    if (me === turnPlayer) {
      return true
    }
    return false
  }


  static makeMonsterAttackable(monsterCard: cc.Node) {
    if (!this.checkIfIAmTurnPlayer()) {
      return
    }
    const cardComp = monsterCard.getComponent(Card);
    if (!cardComp._isAttackable) {
      cardComp._hasEventsBeenModified = true;
    }

    AnimationManager.$.showAnimation(monsterCard, ANIM_COLORS.RED)
    cardComp._isAttackable = true;
    this.makeCardPreviewable(monsterCard);
  }

  static makeItemBuyable(itemCard: cc.Node) {
    if (!this.checkIfIAmTurnPlayer()) {
      return
    }
    const cardComp = itemCard.getComponent(Card);
    if (!cardComp._isBuyable) {
      cardComp._hasEventsBeenModified = true;
    }

    AnimationManager.$.showAnimation(itemCard, ANIM_COLORS.YELLOW)
    cardComp._isBuyable = true;
    // itemCard.off(cc.Node.EventType.TOUCH_START);
    this.makeCardPreviewable(itemCard);
  }

  static makeLootPlayable(lootCard: cc.Node) {
    if (!PlayerManager.mePlayer.getComponent(Player).handCards.includes(lootCard)) {
      return
    }
    const cardComp = lootCard.getComponent(Card);
    if (!lootCard.getComponent(CardEffect).testEffectsPreConditions(false)) {
      return
    }
    if (!cardComp._isPlayable) {
      cardComp._hasEventsBeenModified = true;
    }

    AnimationManager.$.showAnimation(lootCard, ANIM_COLORS.BLUE)
    cardComp._isPlayable = true;
    this.makeCardPreviewable(lootCard);
  }

  static makeItemActivateable(item: cc.Node) {
    const me = PlayerManager.mePlayer.getComponent(Player)
    const myItems = [...me.activeItems, ...me.paidItems, ...me.passiveItems]
    if (!myItems.includes(item)) {
      return
    }
    if (!(item.getComponent(Item).type == ITEM_TYPE.ACTIVE || item.getComponent(Item).type == ITEM_TYPE.ACTIVE_AND_PASSIVE || item.getComponent(Item).type == ITEM_TYPE.PAID || item.getComponent(Item).type == ITEM_TYPE.ACTIVE_AND_PAID || item.getComponent(Item).type == ITEM_TYPE.PASSIVE_AND_PAID || item.getComponent(Item).type == ITEM_TYPE.ALL)) { return }
    //&& !item.getComponent(Item).activated) { return }
    cc.log(`make ${item.name} activateable and check precontidi`)
    if (!item.getComponent(CardEffect).testEffectsPreConditions(false)) {
      cc.log(`${item.name} hasent passed precondition test to make actiavtable`);
      return
    }
    const cardComp = item.getComponent(Card);
    const cardEffectComp = item.getComponent(CardEffect);
    if (!cardComp._isActivateable) {
      cardComp._hasEventsBeenModified = true;
    }

    AnimationManager.$.showAnimation(item, ANIM_COLORS.BLUE)
    cardComp._isActivateable = true;

    this.makeCardPreviewable(item);
  }

  static makeCardReactable(card: cc.Node, reactablePlayer: cc.Node) {
    const cardComp = card.getComponent(Card);
    const cardEffectComp = card.getComponent(CardEffect);
    try {
      if (cardEffectComp.testEffectsPreConditions(false)) {
        if (!cardComp._isReactable) {
          cardComp._hasEventsBeenModified = true;
        }
        cardComp._isReactable = true;
        cardComp._cardHolderId = reactablePlayer.getComponent(Player).playerId
      }
    } catch (error) {
      Logger.error(error)
    }
    // change to show card preview.
    this.makeCardPreviewable(card);

  }

  static makeCardPreviewable(card: cc.Node, groupUuid?: string) {

    const cardPreview = CardPreviewManager.getPreviewByCard(card);
    // if (card.name.includes("Deck")) { card = card.getComponent(Deck).topBlankCard }
    if (cardPreview != null) {
      CardPreviewManager.setGroup(cardPreview, groupUuid)
    }
    card.off(cc.Node.EventType.TOUCH_START);
    card.on(
      cc.Node.EventType.TOUCH_START,
      async () => {
        await CardPreviewManager.getPreviews(Array.of(card), true, groupUuid)
        // cardPreview.showCardPreview2(card);
      },
      this,
    );
    // try {
    //   CardPreviewManager.updatePreviewsEvents()
    // } catch (error) {
    //   cc.error(error)
    //   Logger.error(error)
    // }
  }

  static disableCardActions(card: cc.Node) {
    // if (card == CardManager.treasureDeck.getComponent(Deck).topBlankCard) {
    //   cc.log(`disable top of shop card actions`)
    // }
    card.off(cc.Node.EventType.TOUCH_START);
    if (card.getComponent(Deck) == null) {
      const cardComp = card.getComponent(Card);
      if (cardComp._isActivateable || cardComp._isAttackable || cardComp._isBuyable || cardComp._isPlayable || cardComp._isReactable || cardComp._isRequired) {
        cardComp._hasEventsBeenModified = true
      }
      cardComp._isActivateable = false;
      cardComp._isAttackable = false;
      cardComp._isBuyable = false;
      cardComp._isPlayable = false;
      cardComp._isReactable = false;
      // AnimationManager.$.endAnimation(card)
      // cardComp._isRequired = false;
      // cardComp._requiredFor = null;
      this.makeCardPreviewable(card);
    } else {
      // const comp = card.getComponent(Deck).topBlankCard.getComponent(Card)
      const comp = card.getComponent(Card)
      if (comp._isActivateable || comp._isAttackable || comp._isBuyable || comp._isPlayable || comp._isReactable || comp._isRequired) {
        comp._hasEventsBeenModified = true
      }
      comp._isActivateable = false;
      comp._isAttackable = false;
      comp._isBuyable = false;
      comp._isPlayable = false;
      comp._isReactable = false;

      // comp._isRequired = false;
      // comp._requiredFor = null;
      this.makeCardPreviewable(card);
    }
    //  cc.log(`disable card action ${card.name}`)
    //AnimationManager.$.endAnimation(card)
  }

  static makeRequiredForDataCollector(
    dataCollector: DataCollector,
    card: cc.Node,
    // dataCollectorUuid:string
  ) {

    ParticleManager.activateParticleEffect(card, PARTICLE_TYPES.CHOOSE_CARD, false)
    // let p = card.getComponentInChildren(cc.ParticleSystem);
    // p.resetSystem()

    this.disableCardActions(card);
    if (card.getComponent(Deck) == null) {

      const cardComp = card.getComponent(Card);
      if (!cardComp._isRequired) {
        cardComp._hasEventsBeenModified = true;
      }
      cardComp._isRequired = true;
      cardComp._requiredFor = dataCollector;
    } else {
      const deckComp = card.getComponent(Deck);
      deckComp.node.off(cc.Node.EventType.TOUCH_START)
      if (!deckComp._isRequired) {
        deckComp._hasEventsBeenModified = true;
      }
      deckComp._isRequired = true;
      deckComp._requiredFor = dataCollector;
    }

    /// change to show preview for comfirmation!
    // CardPreviewManager.addPreview(card)
    this.makeCardPreviewable(card, dataCollector.uuid);

  }

  static async unRequiredForDataCollector(card: cc.Node) {
    ParticleManager.disableParticleEffect(card, PARTICLE_TYPES.CHOOSE_CARD, false)
    const cardPreview = CardPreviewManager.getPreviewByCard(card)
    if (cardPreview != null) {
      cardPreview.removeGroup()
      await CardPreviewManager.removeFromCurrentPreviews(Array.of(card))
      // CardPreviewManager.removeFromCurrentPreviews(Array.of(cardPreview.node))
    }
    card.getComponent(Card)._isRequired = false;
    card.getComponent(Card)._requiredFor = null;
    const deckComp = card.getComponent(Deck)
    if (deckComp) {
      deckComp._isRequired = false;
      deckComp._requiredFor = null
    }
    card.off(cc.Node.EventType.TOUCH_START);
    this.makeCardPreviewable(card);
  }

  static requireLootPlay(cards: cc.Node[]) { }

  /**
   *
   * @param card card to get the owner of
   * @returns character if owned by player, monster card if not.
   */
  static getCardOwner(card: cc.Node) {
    let owner: cc.Node
    const player = PlayerManager.getPlayerByCard(card)
    if (player) {
      owner = player.character;
    } else if (card.getComponent(Monster)) {
      owner = card
    } else if (card.getComponent(Item)) {
      owner = card.getComponent(Item).lastOwnedBy.character
    } else { owner = null }
    return owner;
  }

  static updatePlayerCards() {
    const players = PlayerManager.players;
    for (let i = 0; i < players.length; i++) {
      const player = players[i].getComponent(Player);
      player.handCards = [];
      player.deskCards = [];
      player.handCards = player.handCards.concat(player.hand.layoutCards);
      player.deskCards = player.deskCards.concat(
        player.desk.activeItemLayout.getComponent(CardLayout).layoutCards,
        player.desk.passiveItemLayout.getComponent(CardLayout).layoutCards,
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

  static activeMoveAnimations: Array<{ index: number, endBools: boolean[] }> = []
  static moveAnimationIndex: number = 0;

  static async moveCardTo(card: cc.Node, placeToMove: cc.Node, sendToServer: boolean, flipIfFlipped: boolean, moveIndex?: number, firstPos?, playerId?: number) {

    const canvas = cc.find("Canvas")
    if (firstPos != null && sendToServer == false) {
      card.setParent(canvas)
      card.setPosition(firstPos)
    }

    // only for test!

    if (card.parent == null) {
      card.parent = this.$.onTableCardsHolder
      if (!card.active) {
        card.active = true
      }
    }

    const originalPos = canvas.convertToNodeSpaceAR(card.parent.convertToWorldSpaceAR(card.getPosition()));
    cc.log(originalPos)
    const movePos = canvas.convertToNodeSpaceAR(placeToMove.parent.convertToWorldSpaceAR(placeToMove.getPosition()))
    cc.log(movePos)
    const moveAction = cc.moveTo(TIME_TO_DRAW, movePos);
    let animationIndex: number
    if (moveIndex == null || moveIndex == -1) {
      animationIndex = ++this.moveAnimationIndex
    } else {
      animationIndex = moveIndex
      this.moveAnimationIndex = moveIndex;
    }

    const bools: boolean[] = []
    const moveAnimation = { index: animationIndex, endBools: bools }
    this.activeMoveAnimations.push(moveAnimation)
    let placeId: number
    let placeType

    if (sendToServer == true) {
      if (placeToMove.name.includes("Hand")) {
        placeId = placeToMove.getComponent(CardLayout).playerId;
        placeType = `Hand`
      } else if (placeToMove.name.includes("Desk")) {
        placeId = placeToMove.getComponent(PlayerDesk)._playerId
        placeType = `Desk`
      } else if (placeToMove.name.includes("SoulsLayout")) {
        placeId = placeToMove.parent.parent.parent.getComponent(PlayerDesk)._playerId
        placeType = `soulsLayout`
      } else {
        placeId = placeToMove.getComponent(Card)._cardId
        placeType = `Card`
      }
      const serverData = {
        signal: Signal.MOVE_CARD,
        srvData: { moveIndex: animationIndex, cardId: card.getComponent(Card)._cardId, placeID: placeId, flipIfFlipped: flipIfFlipped, firstPos: firstPos, playerId: PlayerManager.mePlayer.getComponent(Player).playerId, placeType: placeType },
      };
      cc.log(`b4 run action`)
      card.runAction(cc.spawn(moveAction, cc.callFunc(() => {
        cc.log(`in send to server`)
        ServerClient.$.send(serverData.signal, serverData.srvData)
      }, this)))
      cc.log(`after run action`)
      await this.waitForMoveAnimationEnd(animationIndex)
      if (flipIfFlipped && card.getComponent(Card)._isFlipped) {
        await card.getComponent(Card).flipCard(false)
      }
      return true
    } else {
      const serverData = {
        signal: Signal.MOVE_CARD_END,
        srvData: { moveIndex: animationIndex, cardId: card.getComponent(Card)._cardId, flipIfFlipped: flipIfFlipped, playerId: playerId },
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
    const moveAnim = this.activeMoveAnimations.find(moveAnim => {
      if (moveAnim.index == moveIndex) {
        return true;
      }
    })
    if (!moveAnim) {
      cc.log(this.activeMoveAnimations)
      throw new Error(`No Active move animation for index ${moveIndex}`)
    }
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
        PileManager.monsterCardPile.getCards(),
      );

    } else {
      const lootPile = cc.find("Canvas/LootCardPile").getComponent(Pile)
      const treasurePile = cc.find("Canvas/TreasureCardPile").getComponent(Pile)
      const monsterPile = cc.find("Canvas/MonsterCardPile").getComponent(Pile)

      this.onTableCards = this.onTableCards.concat(
        Store.storeCards,
        MonsterField.activeMonsters,
        lootPile.getCards(),
        treasurePile.getCards(),
        monsterPile.getCards(),
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

  // static updatePassiveListeners() {
  //   // PassiveManager.clearAllListeners();
  //   for (let i = 0; i < PlayerManager.players.length; i++) {
  //     const player = PlayerManager.players[i].getComponent(Player);
  //     for (let j = 0; j < player.deskCards.length; j++) {
  //       const item = player.deskCards[j];
  //       PassiveManager.registerPassiveItem(item, true);
  //     }
  //     // PassiveManager.registerPassiveItem(player.characterItem);
  //   }
  //   MonsterField.updateActiveMonsters()

  // }

  static async moveCardToSoulsSpot(cardToMove: cc.Node, playerNode: cc.Node, sendToServer: boolean) {
    const soulsLayout = playerNode.getComponent(Player).soulsLayout
    if (sendToServer) { await CardManager.moveCardTo(cardToMove, soulsLayout, sendToServer, true) }
    if (cardToMove.angle != 0) { cardToMove.angle = 0; }

    cardToMove.setPosition(0, 0)
    cardToMove.setParent(soulsLayout);
    cc.log(soulsLayout.parent)
  }

  static getAllDecks() {
    const decks: cc.Node[] = [];
    decks.push(
      CardManager.lootDeck,
      CardManager.monsterDeck,
      CardManager.treasureDeck,
    );
    return decks;
  }

  static setOriginalSprites(cards: cc.Node[]) {
    for (let i = 0; i < cards.length; i++) {
      const cardNode = cards[i];
      const cardComp: Card = cardNode.getComponent(Card);
      const cardSprite: cc.Sprite = cardComp.cardSprite;
      cardSprite.spriteFrame = cardComp.frontSprite;
    }
  }

  static removeFromInAllDecksCards(cardToRemove: cc.Node) {
    const index = this.inDecksCards.indexOf(cardToRemove);
    if (this.inDecksCards.length < index) {
      this.inDecksCards.splice(index, 1);
    }
  }

  static getOtherPlayersHandCards(player: cc.Node) {
    const otherPlayersHandCards: cc.Node[] = [];

    for (let i = 0; i < PlayerManager.players.length; i++) {
      const otherPlayer = PlayerManager.players[i].getComponent(Player);
      if (player.getComponent(Player).playerId != otherPlayer.playerId) {
        otherPlayersHandCards.concat(otherPlayer.handCards);
      }
    }

    return otherPlayersHandCards;
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    CardManager.$ = this
    CardManager.lootDeck = cc.find("Canvas/Loot Deck");
    CardManager.monsterDeck = cc.find("Canvas/Monster Deck");
    CardManager.treasureDeck = cc.find("Canvas/Treasure Deck");
    CardManager.bonusDeck = cc.find("Canvas/Bonus Deck");
    CardManager.store = cc.find("Canvas/Store");
    CardManager.monsterField = cc.find("Canvas/MonsterField");
  }

  start() { }

  // update (dt) {}
}
