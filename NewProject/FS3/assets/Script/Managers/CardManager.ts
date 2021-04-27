import { assetManager, Component, error, find, instantiate, log, Node, NodePool, Prefab, resources, Sprite, SpriteFrame, tween, UITransform, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { whevent } from "../../ServerClient/whevent";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { CARD_TYPE, GAME_EVENTS, ITEM_TYPE, PARTICLE_TYPES, PASSIVE_EVENTS, TIME_TO_DRAW } from "../Constants";
import { CardEffect } from "../Entites/CardEffect";
import { CardLayout } from "../Entites/CardLayout";
import { CardSet } from "../Entites/CardSet";
import { Character } from "../Entites/CardTypes/Character";
import { Item } from "../Entites/CardTypes/Item";
import { Monster } from "../Entites/CardTypes/Monster";
import { Card } from "../Entites/GameEntities/Card";
import { Deck } from "../Entites/GameEntities/Deck";
import { Dice } from "../Entites/GameEntities/Dice";
import { Player } from "../Entites/GameEntities/Player";
import { Pile } from "../Entites/Pile";
import { PlayerDesk } from "../Entites/PlayerDesk";
import { ANIM_COLORS } from "./AnimationManager";
import { PassiveMeta } from "./PassiveMeta";
import { WrapperProvider } from './WrapperProvider';
const { ccclass, property } = _decorator;



@ccclass('CardManager')
export class CardManager extends Component {

      cardsId = 0;

      private onTableCards: Set<number> = new Set()


      getOnTableCards() {
            return Array.from(this.onTableCards.values()).map(cid => this.getCardById(cid))
      }

      addOnTableCards(cards: Node[]) {
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.onTableCards.add(card)
            });
      }

      setOnTableCards(cards: Node[]) {
            this.onTableCards.clear()
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.onTableCards.add(card)
            });
      }
      removeFromOnTableCards(cards: Node[]) {
            const cardsToAdd = cards.map(card => card.getComponent(Card)!._cardId)
            cardsToAdd.forEach(card => {
                  this.onTableCards.delete(card)
            });
      }


      inDecksCardsIds: number[] = [];

      allCards: CardSet = new CardSet()

      allPlayers: Node[] = [];

      currentPlayer: Node | null = null;

      previewOnlyCards: Node[] = [];

      interactableCards: Node[] = [];

      lootDeck!: Node;

      monsterDeck!: Node;

      monsterField: Node | null = null

      store: Node | null = null;

      treasureDeck!: Node;

      bonusDeck!: Node

      characterDeck: Array<{ char: Node; item: Node }> = [];

      characterItemDeck: NodePool | null = null;

      cardPrefab: Prefab | null = null;

      charCardsPrefabs: Prefab[] = [];

      charItemCardsPrefabs: Prefab[] = [];

      charCardBack: SpriteFrame | null = null;

      monsterCardBack: SpriteFrame | null = null;

      lootCardBack: SpriteFrame | null = null;

      treasureCardBack: SpriteFrame | null = null;

      extraSoulsBack: SpriteFrame | null = null;

      CharItemBack: SpriteFrame | null = null;

      charCardSprites: SpriteFrame[] = [];

      monsterCardSprites: SpriteFrame[] = [];

      lootCardSprites: SpriteFrame[] = [];

      treasureCardSprites: SpriteFrame[] = [];

      extraSoulsSprites: SpriteFrame[] = [];

      CharItemSprites: SpriteFrame[] = [];

      charCardPool: NodePool | null = null;

      lootCardPool: NodePool | null = null;

      monsterCardPool: NodePool | null = null;

      treasureCardPool: NodePool | null = null;

      extraSoulsCardPool: NodePool | null = null;

      CharItemCardPool: NodePool | null = null;

      @property(Node)
      onTableCardsHolder: Node | null = null;

      @property(Prefab)
      animationNode: Prefab | null = null

      @property(Prefab)
      cardSpritesPrefab: Prefab | null = null

      @property(Prefab)
      effectCounterPrefab: Prefab | null = null

      effectCounter: Node | null = null;

      getCardNodeByChild(childNode: Node): Node {
            if (childNode.getComponent(Card) != null) {
                  return childNode
            }
            return this.getCardNodeByChild(childNode.parent!)
      }

      GetAllCards() {
            return this.allCards.getCards()
      }

      async init() {
            this.effectCounter = instantiate(this.effectCounterPrefab!)
            this.bonusDeck!.active = false
            console.log(`start prefab Load`)
            const loaded = await this.preLoadPrefabs();
            console.log(`end prefab Load`)
            // this.CharItemCardPool = new NodePool();
            // this.extraSoulsCardPool = new NodePool();
            // this.lootCardPool = new NodePool();
            // this.charCardPool = new NodePool();
            // this.monsterCardPool = new NodePool();
            // this.treasureCardPool = new NodePool();

            const lootDeckComp: Deck = this.lootDeck!.getComponent(Deck)!;
            const treasureDeckComp: Deck = this.treasureDeck!.getComponent(Deck)!;
            const monsterDeckComp: Deck = this.monsterDeck!.getComponent(Deck)!;
            const bonusSouls: Deck = this.bonusDeck!.getComponent(Deck)!

            const decks: Deck[] = [lootDeckComp, treasureDeckComp, monsterDeckComp];

            decks.forEach(d => d.setMouseHover())

            // for (let i = 0; i < decks.length; i++) {
            //   const deck = decks[i];
            //   this.makeDeckCards(deck);
            // }

            // this.makeCharDeck();
            this.sendCardInfoToServer()

            resources.release("Sprites/CardBacks", Prefab)

            return true
      }

      sendCardInfoToServer() {
            const allCards = this.GetAllCards()
            const cardMap: { cardId: number, cardName: string }[] = []
            allCards.forEach(card => {
                  cardMap.push({ cardId: card.getComponent(Card)!._cardId, cardName: card.getComponent(Card)!.cardName })
            })
            WrapperProvider.serverClientWrapper.out.send(Signal.SEND_CARD_DATA, { allCards: JSON.stringify(cardMap) })
      }

      async registerBonusSouls() {
            const cards = this.bonusDeck!.getComponent(Deck)!.getCards()
            for (const card of cards) {
                  await WrapperProvider.passiveManagerWrapper.out.registerPassiveItem(card, true)
            }
      }

      async preLoadPrefabs() {
            const lootDeckComp: Deck = this.lootDeck!.getComponent(Deck)!;
            const treasureDeckComp: Deck = this.treasureDeck!.getComponent(Deck)!;
            const monsterDeckComp: Deck = this.monsterDeck!.getComponent(Deck)!;
            const bonusSouls: Deck = this.bonusDeck!.getComponent(Deck)!
            resources.loadDir<Prefab>("Prefabs/CharacterCards/CharCardsPrefabs", (
                  err,
                  rsc,
            ) => {

                  if (err) {
                        console.log(err)
                        console.log(rsc)
                  }
                  for (let i = 0; i < rsc.length; i++) {
                        const prefab = rsc[i];
                        this.charCardsPrefabs.push(prefab);
                  }
                  resources.loadDir<Prefab>("Prefabs/CharacterCards/CharItemCards", (
                        err,
                        rsc,
                  ) => {

                        if (err) {
                              console.log(err)
                              console.log(rsc)
                        }
                        for (let i = 0; i < rsc.length; i++) {
                              const prefab = rsc[i];
                              this.charItemCardsPrefabs.push(prefab);
                        }
                        this.makeCharDeck()
                        // this.charCardsPrefabs.concat(this.charItemCardsPrefabs).forEach(prefab => {
                        //   assetManager.releaseAsset(prefab); 
                        // });+
                        // this.charItemCardsPrefabs.forEach(prefab => {
                        //   assetManager.releaseAsset(prefab)
                        // })
                        // this.charCardsPrefabs.forEach(prefab => {
                        //   assetManager.releaseAsset(prefab)
                        // })
                        this.charCardsPrefabs = []
                        this.charItemCardsPrefabs = []
                        resources.loadDir<SpriteFrame>(
                              "Sprites/CardBacks",
                              SpriteFrame,
                              (err, rsc) => {

                                    if (err) {
                                          console.log(err)
                                          console.log(rsc)
                                    }
                                    for (let i = 0; i < rsc.length; i++) {
                                          const sprite: SpriteFrame = rsc[i];
                                          switch (sprite.name) {
                                                case "LootBack":
                                                      this.lootCardBack = sprite;
                                                      break;
                                                case "MonsterBack":
                                                      this.monsterCardBack = sprite;
                                                      break;
                                                case "TreasureBack":
                                                      this.treasureCardBack = sprite;
                                                      break;
                                                default:
                                                      break;
                                          }
                                    }
                                    resources.loadDir<Prefab>("Prefabs/LootCards", Prefab, (err, rsc) => {

                                          if (err) {
                                                console.log(err)
                                          }
                                          const lootDeck = lootDeckComp;
                                          lootDeck.cardsPrefab.push(...rsc)
                                          this.makeDeckCards(lootDeck)
                                          const cards = lootDeck.getCards()
                                          cards.forEach(card => {
                                                if (card.getComponent(Card)!.type != CARD_TYPE.LOOT) {
                                                      console.error(`card ${card.name} is in loot deck, should not be here!`)
                                                }
                                          });

                                          lootDeckComp.cardsPrefab.forEach(prefab => {
                                                assetManager.releaseAsset(prefab);
                                          });
                                          //  resources.release("Prefabs/LootCards", Prefab)
                                          resources.loadDir<Prefab>("Prefabs/TreasureCards", Prefab, (err, rsc) => {

                                                if (err) {
                                                      console.log(err)
                                                      console.log(rsc)
                                                }
                                                treasureDeckComp.cardsPrefab.push(...rsc)
                                                this.makeDeckCards(treasureDeckComp)
                                                treasureDeckComp.getCards().forEach(card => {
                                                      if (card.getComponent(Card)!.type != CARD_TYPE.TREASURE) {
                                                            console.error(`card ${card.name} is in treausre deck, should not be here!`)
                                                      }
                                                })
                                                treasureDeckComp.cardsPrefab.forEach(prefab => {
                                                      assetManager.releaseAsset(prefab);
                                                });
                                                //  resources.release("Prefabs/TreasureCards", Prefab)
                                                resources.loadDir<Prefab>("Prefabs/Complete Monster Cards", Prefab, (err, rsc) => {

                                                      if (err) {
                                                            console.log(err)
                                                            console.log(rsc)
                                                      }
                                                      monsterDeckComp.cardsPrefab.push(...rsc)
                                                      this.makeDeckCards(monsterDeckComp)
                                                      monsterDeckComp.getCards().forEach(card => {
                                                            if (card.getComponent(Card)!.type != CARD_TYPE.MONSTER) {
                                                                  console.error(`card ${card.name} is in monster deck, should not be here!`)
                                                            }
                                                      })
                                                      monsterDeckComp.cardsPrefab.forEach(prefab => {
                                                            assetManager.releaseAsset(prefab);
                                                      });
                                                      //   resources.release("Prefabs/Complete Monster Cards", Prefab)
                                                      resources.loadDir<Prefab>("Prefabs/Bonus Souls", Prefab, (err, rsc) => {

                                                            if (err) {
                                                                  throw err
                                                            }

                                                            const bonusDeck = this.bonusDeck!.getComponent(Deck)!;
                                                            bonusDeck.cardsPrefab.push(...rsc)
                                                            this.makeDeckCards(bonusDeck)
                                                            bonusDeck.cardsPrefab.forEach(prefab => {
                                                                  assetManager.releaseAsset(prefab);
                                                            })
                                                            console.log(`end bonus`)
                                                            whevent.emit(GAME_EVENTS.CARD_MANAGER_LOAD_PREFAB)
                                                      })
                                                      // this.prefabLoaded = true;
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

      async waitForPrefabLoad(): Promise<boolean> {
            return new Promise((resolve, reject) => {
                  whevent.onOnce(GAME_EVENTS.CARD_MANAGER_LOAD_PREFAB, () => {
                        resolve(true);
                  })

            });
      }

      getDeckByType(deckType: CARD_TYPE) {
            switch (deckType) {
                  case CARD_TYPE.LOOT:
                        return this.lootDeck;
                  case CARD_TYPE.MONSTER:
                        return this.monsterDeck;
                  case CARD_TYPE.TREASURE:
                        return this.treasureDeck;
                  default:
                        break;
            }
            throw new Error(`No deck found with type ${deckType}`)
      }

      isCheckingForEmptyFields = false;



      /**
       * Search in allCards and Decks for a matching card/Deck
       * @param cardId a card id to get from all cards
       */
      getCardById(cardId: number, includeInDecksCards?: boolean): Node {

            const allCards = this.GetAllCards()
            for (let i = 0; i < allCards.length; i++) {
                  const card = allCards[i].getComponent(Card)!;
                  if (card._cardId == cardId) {
                        return card.node
                  }
            }

            const decks = this.getAllDecks();
            for (let i = 0; i < decks.length; i++) {
                  const deck = decks[i].getComponent(Deck)!;
                  if (deck._cardId == cardId) {
                        return deck.node;
                  } else {
                        if (deck.node.getComponent(Card)!._cardId == cardId) {
                              return deck.node;
                        }
                  }
            }
            for (let i = 0; i < WrapperProvider.playerManagerWrapper.out.dice.length; i++) {
                  const dice = WrapperProvider.playerManagerWrapper.out.dice[i]
                  if (dice.getComponent(Dice)!.diceId == cardId) {
                        return dice;
                  }
            }
            throw new Error(`No card found with id ${cardId}`)

      }

      getCardByName(name: string) {
            const allCards = this.GetAllCards()
            const regEx = new RegExp(name, "i")
            for (let i = 0; i < allCards.length; i++) {
                  const card: Card = allCards[i].getComponent(Card)!;
                  if (card.cardName.search(regEx) != -1) {
                        return card.node;
                  }
            }
            console.error(`no card found`)
            return null;
      }

      addCardToDeck(card: Node, deck: Deck) {
            const cardComp: Card = card.getComponent(Card)!;
            switch (deck.deckType) {
                  case CARD_TYPE.LOOT:
                        cardComp.backSprite = this.lootCardBack;
                        //     this.lootCardPool.put(card);
                        break;
                  case CARD_TYPE.MONSTER:
                        cardComp.backSprite = this.monsterCardBack;

                        break;
                  case CARD_TYPE.TREASURE:
                        cardComp.backSprite = this.treasureCardBack;
                        //    this.treasureCardPool.put(card);
                        break;
                  case CARD_TYPE.BONUS_SOULS:
                        cardComp.backSprite = this.extraSoulsBack;
                        //    this.treasureCardPool.put(card);
                        break;
                  default:
                        break;
            }
            //   if (deck._cardId == -1) {

            //      deck._cardId = ++this.cardsId;
            // }
            cardComp._cardId = ++this.cardsId;

            cardComp.flipCard(false);
            deck.addToDeckOnTop(card, 0, false);
      }

      makeDeckCards(deck: Deck) {
            deck._cardId = ++this.cardsId
            deck.node.getComponent(Card)!._cardId = deck._cardId
            const cardsToBeMade: Prefab[] = deck.cardsPrefab;
            // AnimationManager.addAnimationNode(deck.node)
            for (let i = 0; i < cardsToBeMade.length; i++) {
                  const newCard: Node = instantiate(cardsToBeMade[i]);

                  const cardComp: Card = newCard.getComponent(Card)!;
                  if (cardComp.doNotMake) {
                        newCard.destroy()
                        continue
                  }
                  cardComp.frontSprite = newCard.getComponent(Sprite)!.spriteFrame;
                  cardComp.setSprites()
                  if (cardComp.hasCounter) {

                        cardComp.addCountLable()
                  }

                  // AnimationManager.addAnimationNode(newCard)
                  this.addCardToDeck(newCard, deck)
                  this.allCards.push(newCard)
                  if (cardComp.makeMultiCards) {
                        for (let j = 0; j < cardComp.numOfCopies; j++) {
                              const copyCard = instantiate(newCard);
                              //  copyCard.getComponent(Card)!.setSprites()
                              const copyCardComp = copyCard.getComponent(Card)!;
                              if (cardComp.copiesSprites[j]) {
                                    copyCardComp.frontSprite = cardComp.copiesSprites[j]
                              } else {
                                    copyCardComp.frontSprite = cardComp.frontSprite
                              }
                              if (cardComp.hasCounter) {
                                    cardComp.addCountLable()
                              }
                              copyCardComp.setSprites()
                              copyCard.name = cardComp.node.name + `(${j})`
                              copyCardComp.cardName = cardComp.cardName + `(${j})`
                              this.addCardToDeck(copyCard, deck)
                              this.allCards.push(copyCard)
                        }
                  }
            }
            deck.node.getComponent(Card)!.backSprite = deck.node.getComponent(Sprite)!.spriteFrame!
            deck.node.getComponent(Card)!.frontSprite = deck.node.getComponent(Sprite)!.spriteFrame!
            deck.node.getComponent(Card)!.setSprites()

            deck.cardsPrefab = [];
      }

      makeCharDeck() {
            let characterNode: Node;
            let characterItemNode: Node | null = null;

            for (let j = 0; j < this.charCardsPrefabs.length; j++) {
                  characterNode = instantiate(this.charCardsPrefabs[j]);
                  if (characterNode.getComponent(Card)!.doNotMake) continue
                  const characterComp = characterNode.getComponent(Character)!;
                  //   AnimationManager.addAnimationNode(characterNode)
                  if (characterComp.charItemPrefab) {
                        characterItemNode = instantiate(
                              characterComp.charItemPrefab
                        );
                        //  AnimationManager.addAnimationNode(characterItemNode)
                  }
                  const characterCardComp = characterNode.getComponent(Card)!;
                  characterCardComp.setSprites()
                  characterCardComp._cardId = ++this.cardsId;
                  characterCardComp.frontSprite = characterNode.getComponent(Sprite)!.spriteFrame;
                  if (characterItemNode != null) {
                        const charItemCardComp = characterItemNode.getComponent(Card)!;
                        charItemCardComp.setSprites()
                        charItemCardComp._cardId = ++this.cardsId;
                        charItemCardComp.frontSprite = characterItemNode.getComponent(Sprite)!.spriteFrame;
                        // characterItemNode.parent = director.getScene();
                  }
                  const fullCharCards: { char: Node; item: Node } = {
                        char: characterNode,
                        item: characterItemNode!
                  };
                  //characterNode.parent = director.getScene();
                  this.characterDeck.push(fullCharCards);
                  this.allCards.push(fullCharCards.char)
                  if (fullCharCards.item) {
                        this.allCards.push(fullCharCards.item)
                  }
                  // this.characterItemDeck.put(characterItemNode)
            }
      }

      checkIfIAmTurnPlayer() {
            const me = WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!
            const turnPlayer = WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.getTurnPlayer();
            if (me === turnPlayer) {
                  return true
            }
            return false
      }

      async makeMonsterAttackable(monsterCard: Node) {
            if (!this.checkIfIAmTurnPlayer()) {
                  return
            }
            const cardComp = monsterCard.getComponent(Card)!;
            if (!cardComp._isAttackable) {
                  const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.MONSTER_MADE_ATTACKABLE, [monsterCard], null, monsterCard)
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  passiveMeta.args = afterPassiveMeta.args
                  if (afterPassiveMeta.continue) {

                        cardComp._hasEventsBeenModified = true;

                        WrapperProvider.animationManagerWrapper.out.showAnimation(monsterCard, ANIM_COLORS.RED)

                        cardComp._isAttackable = true;
                        await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
                  }
            }
            this.makeCardPreviewable(monsterCard);
      }

      makeItemBuyable(itemCard: Node) {
            if (!this.checkIfIAmTurnPlayer()) {
                  return
            }
            const cardComp = itemCard.getComponent(Card)!;
            if (!cardComp._isBuyable) {
                  cardComp._hasEventsBeenModified = true;
            }

            WrapperProvider.animationManagerWrapper.out.showAnimation(itemCard, ANIM_COLORS.YELLOW)
            cardComp._isBuyable = true;
            // itemCard.off(Node.EventType.TOUCH_START);
            this.makeCardPreviewable(itemCard);
      }

      makeLootPlayable(lootCard: Node) {
            if (!(WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.getHandCards().indexOf(lootCard) >= 0)) {
                  return
            }
            const cardComp = lootCard.getComponent(Card)!;
            if (!lootCard.getComponent(CardEffect)!.testEffectsPreConditions(false)) {
                  return
            }
            if (!cardComp._isPlayable) {
                  cardComp._hasEventsBeenModified = true;
            }

            WrapperProvider.animationManagerWrapper.out.showAnimation(lootCard, ANIM_COLORS.BLUE)
            cardComp._isPlayable = true;
            this.makeCardPreviewable(lootCard);
      }

      makeItemActivateable(item: Node) {
            const me = WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!
            const myItems = [...me.getActiveItems(), ...me.getPaidItems(), ...me.getPaidItems()]

            if (!(myItems.indexOf(item) >= 0)) {
                  return
            }
            if (!(item.getComponent(Item)!.type == ITEM_TYPE.ACTIVE || item.getComponent(Item)!.type == ITEM_TYPE.ACTIVE_AND_PASSIVE || item.getComponent(Item)!.type == ITEM_TYPE.PAID || item.getComponent(Item)!.type == ITEM_TYPE.ACTIVE_AND_PAID || item.getComponent(Item)!.type == ITEM_TYPE.PASSIVE_AND_PAID || item.getComponent(Item)!.type == ITEM_TYPE.ALL)) { return }
            //&& !item.getComponent(Item)!.activated) { return }
            if (!item.getComponent(CardEffect)!.testEffectsPreConditions(false)) {
                  return
            }
            const cardComp = item.getComponent(Card)!;
            const cardEffectComp = item.getComponent(CardEffect)!;
            if (!cardComp._isActivateable) {
                  cardComp._hasEventsBeenModified = true;
            }

            WrapperProvider.animationManagerWrapper.out.showAnimation(item, ANIM_COLORS.BLUE)
            cardComp._isActivateable = true;

            this.makeCardPreviewable(item);
      }

      makeCardReactable(card: Node, reactablePlayer: Node) {
            const cardComp = card.getComponent(Card)!;
            const cardEffectComp = card.getComponent(CardEffect)!;
            try {
                  if (cardEffectComp.testEffectsPreConditions(false)) {
                        if (!cardComp._isReactable) {
                              cardComp._hasEventsBeenModified = true;
                        }
                        cardComp._isReactable = true;
                        cardComp._cardHolderId = reactablePlayer.getComponent(Player)!.playerId
                  }
            } catch (error) {
                  WrapperProvider.loggerWrapper.out.error(error)
            }
            // change to show card preview.
            this.makeCardPreviewable(card);

      }

      makeCardPreviewable(card: Node, groupUuid?: string) {

            const cardPreview = WrapperProvider.cardPreviewManagerWrapper.out.getPreviewByCard(card);
            // if (card.name.includes("Deck")) { card = card.getComponent(Deck)!.topBlankCard }
            if (cardPreview != null) {
                  WrapperProvider.cardPreviewManagerWrapper.out.setGroup(cardPreview, groupUuid)
            }
            card.off(Node.EventType.TOUCH_START);
            card.on(
                  Node.EventType.TOUCH_START,
                  async () => {
                        await WrapperProvider.cardPreviewManagerWrapper.out.getPreviews(Array.of(card), true, groupUuid)
                        // cardPreview.showCardPreview2(card);
                  },
                  this,
            );
            // try {
            //   WrapperProvider.cardPreviewManagerWrapper.out.updatePreviewsEvents()
            // } catch (error) {
            //   console.error(error)
            //   WrapperProvider.loggerWrapper.out.error(error)
            // }
      }

      disableCardActions(card: Node) {
            // if (card == this.treasureDeck.getComponent(Deck)!.topBlankCard) {
            //   console.log(`disable top of shop card actions`)
            // }
            card.off(Node.EventType.TOUCH_START);
            if (card.getComponent(Deck) == null) {
                  const cardComp = card.getComponent(Card)!;
                  if (cardComp._isActivateable || cardComp._isAttackable || cardComp._isBuyable || cardComp._isPlayable || cardComp._isReactable || cardComp._isRequired) {
                        cardComp._hasEventsBeenModified = true
                  }
                  cardComp._isActivateable = false;
                  cardComp._isAttackable = false;
                  cardComp._isBuyable = false;
                  cardComp._isPlayable = false;
                  cardComp._isReactable = false;
                  // animationManagerWrapper._am.endAnimation(card)
                  // cardComp._isRequired = false;
                  // cardComp._requiredFor|null = null;
                  this.makeCardPreviewable(card);
            } else {
                  // const comp = card.getComponent(Deck)!.topBlankCard.getComponent(Card)
                  const comp = card.getComponent(Card)!
                  if (comp._isActivateable || comp._isAttackable || comp._isBuyable || comp._isPlayable || comp._isReactable || comp._isRequired) {
                        comp._hasEventsBeenModified = true
                  }
                  comp._isActivateable = false;
                  comp._isAttackable = false;
                  comp._isBuyable = false;
                  comp._isPlayable = false;
                  comp._isReactable = false;

                  // comp._isRequired = false;
                  // comp._requiredFor|null = null;
                  this.makeCardPreviewable(card);
            }
            //  console.log(`disable card action ${card.name}`)
            //animationManagerWrapper._am.endAnimation(card)
      }

      makeRequiredForDataCollector(
            dataCollector: DataCollector,
            card: Node,
            // dataCollectorUuid:string
      ) {

            WrapperProvider.particleManagerWrapper.out.activateParticleEffect(card, PARTICLE_TYPES.CHOOSE_CARD, false)
            // let p = card.getComponentInChildren(ParticleSystem);
            // p.resetSystem()

            this.disableCardActions(card);
            if (card.getComponent(Deck) == null) {

                  const cardComp = card.getComponent(Card)!;
                  if (!cardComp._isRequired) {
                        cardComp._hasEventsBeenModified = true;
                  }
                  cardComp._isRequired = true;
                  cardComp._requiredFor = dataCollector;
            } else {
                  const deckComp = card.getComponent(Deck)!;
                  deckComp.node.off(Node.EventType.TOUCH_START)
                  if (!deckComp._isRequired) {
                        deckComp._hasEventsBeenModified = true;
                  }
                  deckComp._isRequired = true;
                  deckComp._requiredFor = dataCollector;
            }

            /// change to show preview for comfirmation!
            // WrapperProvider.cardPreviewManagerWrapper.out.addPreview(card)
            this.makeCardPreviewable(card, dataCollector.uuid);

      }

      async unRequiredForDataCollector(card: Node) {
            WrapperProvider.particleManagerWrapper.out.disableParticleEffect(card, PARTICLE_TYPES.CHOOSE_CARD, false)
            const cardPreview = WrapperProvider.cardPreviewManagerWrapper.out.getPreviewByCard(card)
            if (cardPreview != null) {
                  cardPreview.removeGroup()
                  await WrapperProvider.cardPreviewManagerWrapper.out.removeFromCurrentPreviews(Array.of(card))
                  // WrapperProvider.cardPreviewManagerWrapper.out.removeFromCurrentPreviews(Array.of(cardPreview.node))
            }
            card.getComponent(Card)!._isRequired = false;
            card.getComponent(Card)!._requiredFor = null;
            const deckComp = card.getComponent(Deck)!
            if (deckComp) {
                  deckComp._isRequired = false;
                  deckComp._requiredFor = null
            }
            card.off(Node.EventType.TOUCH_START);
            this.makeCardPreviewable(card);
      }

      requireLootPlay(cards: Node[]) { }

      /**
       *
       * @param card card to get the owner of
       * @returns character if owned by player, monster card if not.
       */
      getCardOwner(card: Node) {
            let owner: Node | null = null
            const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(card)!
            if (player) {
                  owner = player.character;
            } else if (card.getComponent(Monster)) {
                  owner = card
            } else if (card.getComponent(Item)) {
                  owner = card.getComponent(Item)!._lastOwnedBy!.character
            } else { owner = null }
            return owner;
      }

      updatePlayerCards() {
            const players = WrapperProvider.playerManagerWrapper.out.players;
            for (let i = 0; i < players.length; i++) {
                  const player = players[i].getComponent(Player)!;

                  player.setDeskCards([player.character!, player.characterItem!, ...player.desk!.activeItemLayout!.getComponent(CardLayout)!.layoutCards, ...player.desk!.passiveItemLayout!.getComponent(CardLayout)!.layoutCards])
                  player.setHandCards(player.hand!.layoutCards)

                  if (WrapperProvider.playerManagerWrapper.out.mePlayer == player.node) {
                        const handCards = player.getHandCards();
                        for (const handCard of handCards) {
                              const cardComp = handCard.getComponent(Card)!;
                              if (cardComp._isShowingBack) {
                                    cardComp.flipCard(false);
                              }
                        }
                  }
            }
      }

      activeMoveAnimations: Array<{ index: number, endBools: boolean[] }> = []
      moveAnimationIndex = 0;

      async moveCardTo(card: Node, placeToMove: Node, sendToServer: boolean, flipIfFlipped: boolean, moveIndex?: number, firstPos?: any, playerId?: number) {
            const canvas = WrapperProvider.CanvasNode
            if (firstPos != null && sendToServer == false) {
                  card.setParent(canvas)
                  card.setPosition(firstPos)
            }

            // only for test!

            if (card.parent == null) {
                  card.parent = this.onTableCardsHolder
                  if (!card.active) {
                        card.active = true
                  }
            }

            const canvasTrans = canvas!.getComponent(UITransform)!

            const cardParentTrans = (card.parent!.getComponent(UITransform)!);
            const originalPos = canvasTrans.convertToNodeSpaceAR(cardParentTrans.convertToWorldSpaceAR(card.getPosition()));
            const placeToMoveTrans = (placeToMove.parent!.getComponent(UITransform)!);
            const movePos = canvasTrans.convertToNodeSpaceAR(placeToMoveTrans.convertToWorldSpaceAR(placeToMove.getPosition()))
            // const moveAction = moveTo(TIME_TO_DRAW, movePos);
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
                        placeId = placeToMove.getComponent(CardLayout)!.playerId;
                        placeType = `Hand`
                  } else if (placeToMove.name.includes("Desk")) {
                        placeId = placeToMove.getComponent(PlayerDesk)!._playerId
                        placeType = `Desk`
                  } else if (placeToMove.name.includes("SoulsLayout")) {
                        placeId = placeToMove.parent!.parent!.parent!.getComponent(PlayerDesk)!._playerId
                        placeType = `soulsLayout`
                  } else {
                        placeId = placeToMove.getComponent(Card)!._cardId
                        placeType = `Card`
                  }
                  const serverData = {
                        signal: Signal.MOVE_CARD,
                        srvData: { moveIndex: animationIndex, cardId: card.getComponent(Card)!._cardId, placeID: placeId, flipIfFlipped: flipIfFlipped, firstPos: firstPos, playerId: WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId, placeType: placeType },
                  };
                  tween(card)
                        .parallel(tween(card).to(TIME_TO_DRAW, { position: movePos }), tween(card).call(() => {
                              WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
                        })).start()
                  // card.runAction(spawn(moveAction, callFunc(() => {
                  //       serverClientWrapper._sc.send(serverData.signal, serverData.srvData)
                  // }, this)))
                  await this.waitForMoveAnimationEnd(animationIndex)
                  if (flipIfFlipped && card.getComponent(Card)!._isShowingBack) {
                        await card.getComponent(Card)!.flipCard(false)
                  }
                  return true
            } else {
                  const serverData = {
                        signal: Signal.MOVE_CARD_END,
                        srvData: { moveIndex: animationIndex, cardId: card.getComponent(Card)!._cardId, flipIfFlipped: flipIfFlipped, playerId: playerId },
                  };
                  if (moveIndex == null) {
                        serverData.signal = Signal.MOVE_CARD
                  }
                  tween(card)
                        .sequence(tween(card).to(TIME_TO_DRAW, { position: movePos }), tween(card).call(() => {
                              WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
                        })).start()
                  // card.runAction(sequence(moveAction, callFunc(() => {
                  //       serverClientWrapper._sc.send(serverData.signal, serverData.srvData)
                  //       this.removeMoveAnimation(animationIndex)
                  // }, this)))
                  await this.waitForMoveAnimationEnd(animationIndex)
                  if (flipIfFlipped && card.getComponent(Card)!._isShowingBack) {
                        await card.getComponent(Card)!.flipCard(false)
                  }
                  return true
            }
      }

      receiveMoveCardEnd(moveIndex: number) {
            const moveAnim = this.activeMoveAnimations.find(moveAnim => {
                  if (moveAnim.index == moveIndex) {
                        return true;
                  }
            })
            if (!moveAnim) {
                  throw new Error(`No Active move animation for index ${moveIndex}`)
            }
            moveAnim.endBools.push(true)
            if (moveAnim.endBools.length == WrapperProvider.playerManagerWrapper.out.players.length - 1) {
                  this.removeMoveAnimation(moveIndex)
            }
      }

      removeMoveAnimation(moveIndex: number) {
            console.error(`b4 active indexes ${this.activeMoveAnimations.map(s => s.index).toString()}`)
            this.activeMoveAnimations = this.activeMoveAnimations.filter((moveAnim) => moveAnim.index != moveIndex
            )
            console.error(`after active indexes ${this.activeMoveAnimations.map(s => s.index).toString()}`)
            whevent.emit(GAME_EVENTS.CARD_MANAGER_MOVE_ANIM_END, moveIndex)
      }

      isMoveAnimationOver(moveIndex: number) {
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

      waitForMoveAnimationEnd(moveIndex: number) {
            return new Promise((resolve, reject) => {
                  whevent.on(GAME_EVENTS.CARD_MANAGER_MOVE_ANIM_END, (params: any) => {
                        if (params == moveIndex) {
                              resolve(true)
                        }
                  })
            });
      }



      updateOnTableCards() {
            this.onTableCards.clear()
            if (WrapperProvider.pileManagerWrapper.out.lootCardPile != null) {
                  const cardsToAdd = [...Array.from(WrapperProvider.storeWrapper.out.storeCards.values()), ...Array.from(WrapperProvider.monsterFieldWrapper.out.activeMonsters.values()), ...WrapperProvider.pileManagerWrapper.out.lootCardPile.cards, ...WrapperProvider.pileManagerWrapper.out.treasureCardPile.cards, ...WrapperProvider.pileManagerWrapper.out.monsterCardPile.cards]
                  cardsToAdd.forEach(card => {
                        this.onTableCards.add(card)
                  })
            } else {
                  const canvas = WrapperProvider.CanvasNode
                  const lootPile = find("LootCardPile", canvas)!.getComponent(Pile)!
                  const treasurePile = find("TreasureCardPile", canvas)!.getComponent(Pile)!
                  const monsterPile = find("MonsterCardPile", canvas)!.getComponent(Pile)!

                  const cardsToAdd = [...Array.from(WrapperProvider.storeWrapper.out.storeCards.values()), ...Array.from(WrapperProvider.monsterFieldWrapper.out.activeMonsters.values()), ...lootPile.cards, ...treasurePile.cards, ...monsterPile.cards]
                  cardsToAdd.forEach(card => {
                        this.onTableCards.add(card)
                  })
            }

            for (let i = 0; i < WrapperProvider.playerManagerWrapper.out.players.length; i++) {
                  const player = WrapperProvider.playerManagerWrapper.out.players[i].getComponent(Player)!;
                  player.getDeskCards().forEach(card => {
                        this.onTableCards.add(card.getComponent(Card)!._cardId)
                  })
                  this.addOnTableCards(player.getDeskCards());
            }
            for (const tableCard of this.getOnTableCards()) {
                  const cardComp = tableCard.getComponent(Card)!;
                  if (cardComp._isShowingBack) {
                        cardComp.flipCard(false);
                  }
            }
      }

      // updatePassiveListeners() {
      //   // passiveManagerWrapper._pm.clearAllListeners();
      //   for (let i = 0; i < WrapperProvider.playerManagerWrapper.out.players.length; i++) {
      //     const player = WrapperProvider.playerManagerWrapper.out.players[i].getComponent(Player)!;
      //     for (let j = 0; j < player.deskCards.length; j++) {
      //       const item = player.deskCards[j];
      //       passiveManagerWrapper._pm.registerPassiveItem(item, true);
      //     }
      //     // passiveManagerWrapper._pm.registerPassiveItem(player.characterItem);
      //   }
      //   WrapperProvider.monsterFieldWrapper.out.updateActiveMonsters()

      // }

      async moveCardToSoulsSpot(cardToMove: Node, playerNode: Node, sendToServer: boolean) {
            const soulsLayout = playerNode.getComponent(Player)!.soulsLayout!
            if (sendToServer) { await this.moveCardTo(cardToMove, soulsLayout, sendToServer, true) }
            if (cardToMove.angle != 0) { cardToMove.angle = 0; }

            cardToMove.setPosition(0, 0)
            cardToMove.setParent(soulsLayout);
      }

      getAllDecks() {
            const decks: Node[] = [];
            decks.push(
                  this.lootDeck!,
                  this.monsterDeck!,
                  this.treasureDeck!,
            );
            return decks;
      }

      setOriginalSprites(cards: Node[]) {
            for (let i = 0; i < cards.length; i++) {
                  const cardNode = cards[i];
                  const cardComp: Card = cardNode.getComponent(Card)!;
                  const cardSprite: Sprite = cardComp.cardSprite!;
                  cardSprite.spriteFrame = cardComp.frontSprite;
            }
      }

      removeFromInAllDecksCards(cardToRemove: Node) {
            const index = this.inDecksCardsIds.indexOf(cardToRemove.getComponent(Card)!._cardId)!;
            if (this.inDecksCardsIds.length < index) {
                  this.inDecksCardsIds.splice(index, 1);
            }
      }

      getOtherPlayersHandCards(player: Node) {
            const otherPlayersHandCards: Node[] = [];

            for (let i = 0; i < WrapperProvider.playerManagerWrapper.out.players.length; i++) {
                  const otherPlayer = WrapperProvider.playerManagerWrapper.out.players[i].getComponent(Player)!;
                  if (player.getComponent(Player)!.playerId != otherPlayer.playerId) {
                        otherPlayersHandCards.concat(otherPlayer.getHandCards());
                  }
            }

            return otherPlayersHandCards;
      }

      // LIFE-CYCLE CALLBACKS:

      onLoad() {
            const canvas = WrapperProvider.CanvasNode
            this.lootDeck = find("Loot Deck", canvas)!;
            this.monsterDeck = find("Monster Deck", canvas)!;
            this.treasureDeck = find("Treasure Deck", canvas)!;
            this.bonusDeck = find("Bonus Deck", canvas)!;
            this.store = find("Store", canvas);
            this.monsterField = find("MonsterField", canvas);
            this.onTableCards = new Set();
      }

      start() { }

      // update (dt) {}
}
