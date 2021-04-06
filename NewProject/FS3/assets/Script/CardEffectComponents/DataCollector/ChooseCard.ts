import { find, Graphics, math, Node, UITransform, _decorator } from 'cc';
import { whevent } from "../../../ServerClient/whevent";
import { Item } from "../../Entites/CardTypes/Item";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Card } from "../../Entites/GameEntities/Card";
import { Deck } from "../../Entites/GameEntities/Deck";
import { Player } from "../../Entites/GameEntities/Player";
import { EffectTarget } from "../../Managers/EffectTarget";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { ActivateItem } from "../../StackEffects/ActivateItem";
import { ChooseCardTypeAndFilter } from "../ChooseCardTypeAndFilter";
import { CARD_TYPE, CHOOSE_CARD_TYPE, GAME_EVENTS } from "./../../Constants";
import { DataCollector } from "./DataCollector";
const { ccclass, property } = _decorator;


@ccclass('ChooseCard')
export class ChooseCard extends DataCollector {
  collectorName = "ChooseCard";
  cardChosen!: Node;
  playerId!: number;

  // private _isCardChosen: boolean = false;

  setIsCardChosen(boolean: boolean) {
    this.isCardChosen = boolean;
    whevent.emit(GAME_EVENTS.CHOOSE_CARD_CARD_CHOSEN, boolean)
  }


  @property
  multiType = false;


  otherPlayer: Player | null = null

  @property
  isChooseFromPreviewManager = false

  //@ts-ignore
  @property({
    type: ChooseCardTypeAndFilter, visible: function (this: ChooseCard) {
      return !this.multiType && !this.isGetCardsToChooseFromFromAnotherCollector
    }
  })
  chooseType: ChooseCardTypeAndFilter | null = new ChooseCardTypeAndFilter();

  //@ts-ignore
  @property({
    type: [ChooseCardTypeAndFilter], visible: function (this: ChooseCard) {
      if (this.multiType && !this.isGetCardsToChooseFromFromAnotherCollector) { return true }
    }
  })
  chooseTypes: ChooseCardTypeAndFilter[] = []

  @property
  filterFromPassiveMeta = false;

  @property({
    visible: function (this: ChooseCard) {
      return this.filterFromPassiveMeta
    }
    , type: DataCollector
  })
  targetCollectorFromPassiveMeta: DataCollector | null = null


  @property
  flavorText = ""

  @property
  otherPlayersFlavorText = ''

  @property
  isMultiCardChoice = false;

  //@ts-ignore
  @property({
    visible: function (this: ChooseCard) {
      if (this.isMultiCardChoice) return true
    }
  })
  numOfCardsToChoose = 1

  @property({ visible: function (this: ChooseCard) { return this.isMultiCardChoice } })
  isChooseUpTo = false;

  @property
  isGetCardsToChooseFromFromAnotherCollector = false

  @property({ type: DataCollector, visible: function (this: ChooseCard) { return this.isGetCardsToChooseFromFromAnotherCollector } })
  dataCollectorToGetCardsFrom: DataCollector | null = null

  /**
   *  @throws when there are no cards to choose from in the choose type
   * @param data cardPlayerId:Player who played the card
   * @returns {target:node of the player who played the card}
   */

  async collectData(data: { cardPlayerId: number }): Promise<EffectTarget | EffectTarget[]> {
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!
    this.playerId = data.cardPlayerId;
    let cardsToChooseFrom: Node[] = []
    cardsToChooseFrom = await this.getCardsToChooseFrom(player, cardsToChooseFrom, data);
    cardsToChooseFrom = this.filterCardsToChooseFrom(cardsToChooseFrom);
    if (cardsToChooseFrom.length == 0) {
      throw new Error("No Cards To Choose From!")
    }
    if (cardsToChooseFrom.length == 1) {
      if (this.node) {
        await WrapperProvider.decisionMarkerWrapper.out.showDecision(WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node), cardsToChooseFrom[0], true)
      }
      return WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(cardsToChooseFrom[0])
    }

    if (this.isMultiCardChoice) {
      let chosenCards: EffectTarget[] = []
      if (this.isChooseFromPreviewManager) {
        chosenCards = (await WrapperProvider.cardPreviewManagerWrapper.out.selectFromCards(cardsToChooseFrom, this.numOfCardsToChoose, this.isChooseUpTo)).map(e => WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(e))
      } else {
        for (let i = 0; i < this.numOfCardsToChoose; i++) {
          cardsToChooseFrom = cardsToChooseFrom.filter(card => !(chosenCards.map(target => target.effectTargetCard).indexOf(card) >= 0))

          chosenCards.push(await this.getCardTargetFromPlayer(cardsToChooseFrom))
        }
      }
      return chosenCards
    } else {
      if (this.isChooseFromPreviewManager) {
        return (await WrapperProvider.cardPreviewManagerWrapper.out.selectFromCards(cardsToChooseFrom, 1)).map(e => WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(e))
      } else {
        return await this.getCardTargetFromPlayer(cardsToChooseFrom);
      }
    }

  }

  private filterCardsToChooseFrom(cardsToChooseFrom: Node[]) {
    if (this.filterFromPassiveMeta) {
      if (!this.targetCollectorFromPassiveMeta) { debugger; throw new Error("No Target Collector From Passive Meta"); }

      const target = this.targetCollectorFromPassiveMeta.collectData(null);
      if (target) {
        cardsToChooseFrom = cardsToChooseFrom.filter(card => card != target.effectTargetCard);
      }
    }
    return cardsToChooseFrom;
  }

  private async getCardsToChooseFrom(player: Player, cardsToChooseFrom: Node[], data: { cardPlayerId: number }) {
    if (this.isGetCardsToChooseFromFromAnotherCollector) {
      const targets = await this.dataCollectorToGetCardsFrom?.collectData(data) as EffectTarget[] | EffectTarget
      if (Array.isArray(targets)) {
        cardsToChooseFrom = targets.map(t => t.effectTargetCard)
      } else {
        cardsToChooseFrom.push(targets.effectTargetCard)
      }
    } else if (this.multiType) {
      for (const filterComp of this.chooseTypes) {
        let tempCards = this.getCardsToChoose(filterComp.chooseType, player, this.otherPlayer!);
        if (tempCards) {
          if (filterComp.applyFilter) {
            tempCards = this.applyFilterToCards(tempCards, filterComp);
          }
          tempCards.forEach(card => {
            if (card) { cardsToChooseFrom.push(card); }
          });
        }
        //cardToChooseFrom.add(tempCards)
        //  cardsToChooseFrom = cardsToChooseFrom.concat(this.getCardsToChoose(type, player))
      }
    } else {
      this.getCardsToChoose(this.chooseType!.chooseType, player, this.otherPlayer!).forEach(card => {
        if (card) { cardsToChooseFrom.push(card); }
      });
      if (this.chooseType!.applyFilter) {
        cardsToChooseFrom = this.applyFilterToCards(cardsToChooseFrom, this.chooseType!);
      }
    }
    return cardsToChooseFrom;
  }

  private async getCardTargetFromPlayer(cardsToChooseFrom: Node[]) {

    const cardChosenData: {
      cardChosenId: number;
      playerId: number;
    } = await this.requireChoosingACard(cardsToChooseFrom);
    debugger
    const target = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(WrapperProvider.cardManagerWrapper.out.getCardById(cardChosenData.cardChosenId, true));
    return target;
  }

  async collectDataOfPlaces(data: {
    cardPlayerId: number;
    deckType: CARD_TYPE;
  }): Promise<{
    cardChosenId: number;
    playerId: number;
  }> {
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!
    this.playerId = data.cardPlayerId;
    //what cards to choose from
    let cardsToChooseFrom: Node[] = [];
    switch (data.deckType) {
      case CARD_TYPE.MONSTER:
        cardsToChooseFrom = this.getCardsToChoose(
          CHOOSE_CARD_TYPE.MONSTER_PLACES,
          player, this.otherPlayer!
        );
        break;
      case CARD_TYPE.TREASURE:
        cardsToChooseFrom = this.getCardsToChoose(
          CHOOSE_CARD_TYPE.STORE_PLACES,
          player, this.otherPlayer!
        );
        break;
      default:
        break;
    }
    const cardChosenData: {
      cardChosenId: number;
      playerId: number;
    } = await this.requireChoosingACard(cardsToChooseFrom);
    return cardChosenData;
  }

  getCardsToChoose(chooseType: CHOOSE_CARD_TYPE, mePlayer?: Player, spesificPlayer?: Player): Node[] {
    let cardsToReturn: Node[] = [];
    let players: Player[]
    switch (chooseType) {
      //Get all available player char cards
      case CHOOSE_CARD_TYPE.ALL_PLAYERS:
        let playerCards: Node[] = [];
        for (let index = 0; index < WrapperProvider.playerManagerWrapper.out.players.length; index++) {
          mePlayer = WrapperProvider.playerManagerWrapper.out.players[index].getComponent(Player)!;
          playerCards.push(mePlayer.character!);
        }
        return playerCards;

      // Get all of the chosen player hand cards
      case CHOOSE_CARD_TYPE.MY_HAND:
        return mePlayer?.getHandCards() ?? [];
      case CHOOSE_CARD_TYPE.MY_SOUL_CARDS:
        ///Set to True, Cant Really See Accuired Soul Cards, SO Choose form previewes
        this.isChooseFromPreviewManager = true
        return mePlayer?.getSoulCards() ?? []
      case CHOOSE_CARD_TYPE.PILES:
        return WrapperProvider.pileManagerWrapper.out.getTopCardOfPiles()
      case CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND:
        return spesificPlayer?.getHandCards() ?? []
      case CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS_WITHOUT_ETERNALS:
        return spesificPlayer?.getDeskCards().filter(card => { if (!(card.getComponent(Item)!.eternal)) { return true } }) ?? []
      case CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS:
        return spesificPlayer?.getDeskCards() ?? []
      case CHOOSE_CARD_TYPE.DECKS:
        cardsToReturn = WrapperProvider.cardManagerWrapper.out.getAllDecks();
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MONSTER_PLACES:
        const monsterPlaces = WrapperProvider.monsterFieldWrapper.out.getActiveMonsters();
        return monsterPlaces;
      case CHOOSE_CARD_TYPE.NON_ATTACKED_ACTIVE_MONSTERS:
        return WrapperProvider.monsterFieldWrapper.out.getActiveMonsters().filter(monster => {
          if (WrapperProvider.battleManagerWrapper.out.currentlyAttackedMonsterNode != monster || WrapperProvider.stackWrapper.out._currentStack.findIndex(se => {
            if (se instanceof ActivateItem &&
              se.itemToActivate.getComponent(Monster) != null &&
              se.itemToActivate == monster) {
              return true
            }
          }) != -1) { return true }
        })

      case CHOOSE_CARD_TYPE.MY_NON_ETERNALS:
        if (!mePlayer) return []
        cardsToReturn = mePlayer.getDeskCards().filter(card => !card.getComponent(Item)!.eternal);
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS:
        players = WrapperProvider.playerManagerWrapper.out.players.map(player => player.getComponent(Player)!)
        for (const player of players) {
          //    let activeItems = player.getActiveItems().map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //  
          cardsToReturn = cardsToReturn.concat(player.getActiveItems(), player.getPassiveItems(), player.getPaidItems()).filter(c => !(player._curses.indexOf(c) >= 0))
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_ACTIVATED_ITEMS:
        players = WrapperProvider.playerManagerWrapper.out.players.map(player => player.getComponent(Player)!)
        for (const player of players) {
          //    let activeItems = player.getActiveItems().map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //
          cardsToReturn = cardsToReturn.concat(player.getActiveItems().filter(item => {
            if (item.getComponent(Item)!.needsRecharge) {
              return true
            }
          }))
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_SOUL_CARDS:
        players = WrapperProvider.playerManagerWrapper.out.players.map(player => player.getComponent(Player)!)
        for (const player of players) {
          //    let activeItems = player.getActiveItems().map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //
          cardsToReturn = cardsToReturn.concat(player.soulsLayout!.children)
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_NON_ACTIVATED_ITEMS:
        players = WrapperProvider.playerManagerWrapper.out.players.map(player => player.getComponent(Player)!)
        for (const player of players) {
          //    let activeItems = player.getActiveItems().map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //
          cardsToReturn = cardsToReturn.concat(player.getActiveItems().filter(item => {
            if (!item.getComponent(Item)!.needsRecharge) {
              return true
            }

          }))
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_ITEMS:
        if (!mePlayer) return []
        cardsToReturn = mePlayer.getDeskCards().filter(
          card => !card.getComponent(Item)!.eternal
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_ACTIVATED_ITEMS:
        if (!mePlayer) return []
        cardsToReturn = mePlayer.getDeskCards().filter(
          card => card.getComponent(Item)!.needsRecharge
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_NON_ACTIVATED_ITEMS:
        if (!mePlayer) return []
        cardsToReturn = mePlayer.getDeskCards().filter(
          card => !card.getComponent(Item)!.needsRecharge
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.PLAYERS_AND_ACTIVE_MONSTERS:
        playerCards = [];
        for (let index = 0; index < WrapperProvider.playerManagerWrapper.out.players.length; index++) {
          mePlayer = WrapperProvider.playerManagerWrapper.out.players[index].getComponent(Player)!;
          playerCards.push(mePlayer.character!);
        }
        cardsToReturn = WrapperProvider.monsterFieldWrapper.out.getActiveMonsters().concat(playerCards);
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_CURSES:
        if (!mePlayer) return []
        return mePlayer._curses
      case CHOOSE_CARD_TYPE.ALL_CURSES:
        WrapperProvider.playerManagerWrapper.out.players.forEach(player => { cardsToReturn.concat((player.getComponent(Player)!._curses)) })
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_NON_ETERNAL_ITEMS:
        WrapperProvider.playerManagerWrapper.out.players.forEach(player => {
          const playerComp = player.getComponent(Player)!;
          cardsToReturn = cardsToReturn.concat((playerComp.getDeskCards().filter(card => {
            if (!card.getComponent(Item)!.eternal) { return true; }
          }).filter(c => !(playerComp._curses.indexOf(c) >= 0))))
        })
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.OTHER_PLAYERS_NON_ETERNAL_ITEMS:
        WrapperProvider.playerManagerWrapper.out.players.forEach(player => {
          const playerComp = player.getComponent(Player)!;
          if (playerComp.me) { return }
          cardsToReturn = cardsToReturn.concat(playerComp.soulsLayout!.children)
        })
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.OTHER_PLAYERS_SOUL_CARDS:
        WrapperProvider.playerManagerWrapper.out.players.forEach(player => {
          const playerComp = player.getComponent(Player)!;
          if (playerComp.me) { return }
          cardsToReturn = cardsToReturn.concat((playerComp.getDeskCards().filter(card => {
            if (!card.getComponent(Item)!.eternal) { return true; }
          }).filter(c => !(playerComp._curses.indexOf(c) >= 0))))
        })
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.STORE_CARDS:
        return WrapperProvider.storeWrapper.out.getStoreCards();
      case CHOOSE_CARD_TYPE.IN_TREASURE_DECK_GUPPY_ITEMS:
        return WrapperProvider.cardManagerWrapper.out.treasureDeck!.getComponent(Deck)!.getCards().filter(e => e.getComponent(Item)!.isGuppyItem)
      case CHOOSE_CARD_TYPE.MOST_SOULS_PLAYERS:
        players = WrapperProvider.playerManagerWrapper.out.players.map(p => p.getComponent(Player)!)
        let mostSoulsPlayers: Player[] = []
        players.forEach(player => {
          mostSoulsPlayers = mostSoulsPlayers.filter(p => p.souls >= player.souls)
          if (mostSoulsPlayers.length == 0 || mostSoulsPlayers.some(p => p.souls == player.souls)) {
            mostSoulsPlayers.push(player)
          }
        })
        return mostSoulsPlayers.map(p => p.character!)
      case CHOOSE_CARD_TYPE.IN_PILE_LOOT_CARDS:
        return WrapperProvider.pileManagerWrapper.out.lootCardPile.getCards()
      case CHOOSE_CARD_TYPE.IN_PILE_TREASURE_CARDS:
        return WrapperProvider.pileManagerWrapper.out.treasureCardPile.getCards()
      case CHOOSE_CARD_TYPE.IN_PILE_MONSTER_CARDS:
        return WrapperProvider.pileManagerWrapper.out.monsterCardPile.getCards()
      case CHOOSE_CARD_TYPE.MOM_MOMS_HEART:
        return WrapperProvider.cardManagerWrapper.out.GetAllCards().filter(c => c.name == "Mom!" || c.name == "Mom's Heart!")
      default:
        return []
    }
  }

  async requireChoosingACard(cardsToChooseFrom: Node[]): Promise<{ cardChosenId: number; playerId: number }> {
    WrapperProvider.actionManagerWrapper.out.inReactionPhase = true;

    const cards = new Set<Node>();
    for (const card of cardsToChooseFrom) {
      if (card != null && card != undefined) { cards.add(card) }
    }
    // const id = this.node.uuid
    const flippedCards: Node[] = []
    cards.forEach(card => {
      WrapperProvider.cardManagerWrapper.out.disableCardActions(card);
      const cardComp = card.getComponent(Card)!;
      if (cardComp._isShowingBack) {
        cardComp.flipCard(false)
        flippedCards.push(card)
      }
      WrapperProvider.cardManagerWrapper.out.makeRequiredForDataCollector(this, card);
    })
    WrapperProvider.cardPreviewManagerWrapper.out.setFalvorText(this.flavorText)
    // for (let i = 0; i < cards.size; i++) {
    //   const card = cards[i];

    // }
    const cardPlayed = await this.waitForCardToBeChosen();
    WrapperProvider.cardPreviewManagerWrapper.out.setFalvorText("")
    //   let cardServerEffect = await WrapperProvider.cardManagerWrapper.out.getCardEffect(cardPlayed,this.playerId)
    cards.forEach(async card => {
      await WrapperProvider.cardManagerWrapper.out.unRequiredForDataCollector(card);
    })
    if (this.node) {
      await WrapperProvider.decisionMarkerWrapper.out.showDecision(WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node), cardPlayed, true)
    }
    flippedCards.forEach(card => card.getComponent(Card)!.flipCard(false))
    // for (let i = 0; i < cards.size; i++) {
    //   const card = cards[i];
    //   //  WrapperProvider.cardManagerWrapper.out.disableCardActions(card);
    // }
    let cardId;
    if (cardPlayed.getComponent(Deck) == null) {
      cardId = cardPlayed.getComponent(Card)!._cardId;
    } else {
      cardId = cardPlayed.getComponent(Deck)!._cardId;
    }
    WrapperProvider.actionManagerWrapper.out.inReactionPhase = false;
    return { cardChosenId: cardId, playerId: this.playerId }
  }

  async waitForCardToBeChosen(): Promise<Node> {
    if (this.otherPlayersFlavorText == '') {
      WrapperProvider.announcementLableWrapper.out.showAnnouncement(`Player ${this.playerId} is Choosing Target`, 0, true)
    } else {
      WrapperProvider.announcementLableWrapper.out.sendToServerShowAnnouncment(this.otherPlayersFlavorText)
    }
    return new Promise((resolve) => {
      whevent.onOnce(GAME_EVENTS.CHOOSE_CARD_CARD_CHOSEN, (data: any) => {
        WrapperProvider.announcementLableWrapper.out.hideAnnouncement(true)
        if (data) {
          resolve(this.cardChosen);
        }
      })
    })
  }

  applyFilterToCards(cards: Node[], filterComponetnt: ChooseCardTypeAndFilter) {
    console.log(filterComponetnt.getFilterString())
    console.log(cards.map(c => c.name))
    const fn1 = new Function("card", filterComponetnt.getFilterString())
    return cards.filter(fn1 as (x: any) => boolean)
    //cardsToChooseFrom = cardsToChooseFrom.filter()

  }

  makeArrow(cardChosen: Node) {
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    const canvas = WrapperProvider.CanvasNode
    const arrowGfx = find("ArrowGFX", canvas)!
    const cavnasTrans = canvas.getComponent(UITransform)!;
    const thisCardTrans = (thisCard.getComponent(UITransform)!);
    const arrowOrigin = cavnasTrans.convertToNodeSpaceAR(thisCardTrans.convertToWorldSpaceAR(math.v3(thisCard.position.x + thisCardTrans.width / 2, thisCard.position.x)))
    const cardChosenTrans = (cardChosen.getComponent(UITransform)!);
    const arrowEndPoint = cavnasTrans.convertToNodeSpaceAR(cardChosenTrans.convertToWorldSpaceAR(math.v3(cardChosen.position.x - cardChosenTrans.width / 2, cardChosen.position.x)))
    const graphics = arrowGfx.getComponent(Graphics)!
    console.log(`origin x:${arrowOrigin.x} y:${arrowOrigin.y}`)
    console.log(`end x:${arrowEndPoint.x} y:${arrowEndPoint.y}`)
    //  graphics.lineWidth = 60
    graphics.moveTo(arrowOrigin.x, arrowOrigin.y)
    graphics.lineTo(arrowEndPoint.x, arrowEndPoint.y)
    graphics.stroke()
  }
}
