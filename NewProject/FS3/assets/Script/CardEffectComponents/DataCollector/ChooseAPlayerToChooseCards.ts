import { find, Graphics, log, Node, UITransform, v3, _decorator } from 'cc';
import { Signal } from "../../../Misc/Signal";
import { whevent } from "../../../ServerClient/whevent";
import { Item } from "../../Entites/CardTypes/Item";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Card } from "../../Entites/GameEntities/Card";
import { Deck } from "../../Entites/GameEntities/Deck";
import { Player } from "../../Entites/GameEntities/Player";
import { EffectTarget } from "../../Managers/EffectTarget";
import { EffectTargetFactory } from '../../Managers/EffectTargetFactory';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { ActivateItem } from "../../StackEffects/ActivateItem";
import { ChooseCardTypeAndFilter } from "../ChooseCardTypeAndFilter";
import { CARD_TYPE, CHOOSE_CARD_TYPE, GAME_EVENTS } from "./../../Constants";
import { DataCollector } from "./DataCollector";
import { GetTargetFromPassiveMeta } from "./GetTargetFromPassiveMeta";
const { ccclass, property } = _decorator;


@ccclass('ChooseAPlayerToChooseCards')
export class ChooseAPlayerToChooseCards extends DataCollector {
  collectorName = "ChooseAPlayerToChooseCards";
  cardChosen: Node | null = null;
  playerId: number | null = null;

  setIsCardChosen(boolean: boolean) {
    this.isCardChosen = boolean;
    whevent.emit(GAME_EVENTS.CHOOSE_CARD_CARD_CHOSEN, boolean)
  }
  @property
  multiType: boolean = false;

  otherPlayer: Player | null = null
  @property({
    type: ChooseCardTypeAndFilter, visible: function (this: ChooseAPlayerToChooseCards) {
      return !this.multiType
    }
  })
  chooseType: ChooseCardTypeAndFilter | null = null;
  @property({
    type: [ChooseCardTypeAndFilter], visible: function (this: ChooseAPlayerToChooseCards) {
      return this.multiType
    }
  })
  chooseTypes: ChooseCardTypeAndFilter[] = []
  @property
  filterFromPassiveMeta: boolean = false;
  @property({
    visible: function (this: ChooseAPlayerToChooseCards) {
      return this.filterFromPassiveMeta
    }
    , type: GetTargetFromPassiveMeta
  })
  targetCollectorFromPassiveMeta: GetTargetFromPassiveMeta | null = null
  @property
  flavorText: string = ""
  @property
  otherPlayersFlavorText: string = ''
  @property
  isMultiCardChoice: boolean = false;
  @property({
    visible: function (this: ChooseAPlayerToChooseCards) {
      return this.isMultiCardChoice
    }
  })
  numOfCardsToChoose: number = 1
  // @property(CCInteger)
  // playerChooseCardIdFinal: number = -1

  @property(DataCollector)
  playerChooseCard: DataCollector | null = null

  @property
  returnSelectedPlayerAlso: boolean = false

  // getPlayerChooseCard = () => this.node.getComponent(CardEffect)!.getDataCollector(this.playerChooseCardIdFinal)
  getPlayerChooseCard = () => this.playerChooseCard
  /**
   *  @throws when there are no cards to choose from in the choose type
   * @param data cardPlayerId:Player who played the card
   * @returns {target:node of the player who played the card}
   */
  async collectData(data: { cardPlayerId: number }): Promise<any> {
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!
    this.playerId = data.cardPlayerId;

    const playerChooseCard = this.getPlayerChooseCard();
    if (!playerChooseCard) { debugger; throw new Error("No Player Choose Card Set!!"); }

    const playerToChooseCardsTargets: EffectTarget[] = await playerChooseCard.collectData(data) as EffectTarget[]
    const playerToChooseCards = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerToChooseCardsTargets[0].effectTargetCard)!
    let retVal: EffectTarget | EffectTarget[] = []
    let cardsToChooseFrom: Node[] = []
    if (this.multiType) {
      for (const filterComp of this.chooseTypes) {
        let tempCards = this.getCardsToChoose(filterComp.chooseType, player, playerToChooseCards)
        if (tempCards) {
          if (filterComp.applyFilter) {
            tempCards = this.applyFilterToCards(tempCards, filterComp);
          }
          tempCards.forEach((card: Node) => {
            if (card) { cardsToChooseFrom.push(card) }
          })
        }
      }
    } else {
      this.getCardsToChoose(this.chooseType!.chooseType, player, playerToChooseCards).forEach((card: Node) => {
        if (card) { cardsToChooseFrom.push(card) }
      });
      if (this.chooseType!.applyFilter) {
        cardsToChooseFrom = this.applyFilterToCards(cardsToChooseFrom, this.chooseType!);
      }
    }
    if (this.filterFromPassiveMeta) {
      const target = this.targetCollectorFromPassiveMeta!.collectData(null)
      if (target) {
        cardsToChooseFrom = cardsToChooseFrom.filter((card: Node) => card != target.effectTargetCard)
      }
    }
    if (cardsToChooseFrom.length == 0) {
      throw new Error("No Cards To Choose From!")
    }
    if (cardsToChooseFrom.length == 1) {
      if (this.node) {
        await WrapperProvider.decisionMarkerWrapper.out.showDecision(WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node), cardsToChooseFrom[0], true)
      }
      retVal = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(cardsToChooseFrom[0])
      if (this.returnSelectedPlayerAlso) {
        retVal = [retVal, WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(playerToChooseCards.character!)]
      }
      return retVal
    }

    retVal = await this.getCardTargetFromPlayer(cardsToChooseFrom, playerToChooseCards, this.numOfCardsToChoose)
    if (this.returnSelectedPlayerAlso) {
      retVal.push(WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(playerToChooseCards.character!))
    }
    return retVal

  }
  async getCardTargetFromPlayer(cardsToChooseFrom: Node[], targetPlayer: Player, numOfCardsToChoose: number) {
    WrapperProvider.serverClientWrapper.out.send(Signal.MAKE_CHOOSE_FROM, {
      cards: cardsToChooseFrom.map(c => c.getComponent(Card)!._cardId), playerId: targetPlayer.playerId,
      numOfCardsToChoose, originPlayerId: this.playerId, flavorText: this.flavorText
    })
    const chosenCardsIds = await this.waitForPlayerReaction()
    const targets: EffectTarget[] = []
    for (let index = 0; index < chosenCardsIds.length; index++) {
      const id = chosenCardsIds[index];
      const target = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(WrapperProvider.cardManagerWrapper.out.getCardById(id, true));
      targets.push(target)
    }
    return targets;
  }
  waitForPlayerReaction(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.DID_CHOOSE_FROM, (cardsChosen: number[]) => {
        resolve(cardsChosen);
      });
    })
  }
  async collectDataOfPlaces(data: {
    cardPlayerId: number;
    deckType: CARD_TYPE;
  }): Promise<{ cardChosenId: number; playerId: number; }> {
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!
    this.playerId = data.cardPlayerId;
    //what cards to choose from
    let cardsToChooseFrom;
    switch (data.deckType) {
      case CARD_TYPE.MONSTER:
        cardsToChooseFrom = this.getCardsToChoose(CHOOSE_CARD_TYPE.MONSTER_PLACES, player, this.otherPlayer!);
        break;
      case CARD_TYPE.TREASURE:
        cardsToChooseFrom = this.getCardsToChoose(CHOOSE_CARD_TYPE.STORE_PLACES, player, this.otherPlayer!);
        break;
      default:
        throw new Error("No Deck Type Handler");

        break;
    }
    const cardChosenData: {
      cardChosenId: number;
      playerId: number;
    } = await this.requireChoosingACard(cardsToChooseFrom);
    return cardChosenData;
  }

  getCardsToChoose(chooseType: CHOOSE_CARD_TYPE, mePlayer?: Player, spesificPlayer?: Player) {
    let cardsToReturn: Node[] = [];
    let players: Player[]
    switch (chooseType) {
      // Get all available player char cards
      case CHOOSE_CARD_TYPE.ALL_PLAYERS:
        let playerCards: Node[] = [];
        for (let index = 0; index < WrapperProvider.playerManagerWrapper.out.players.length; index++) {
          mePlayer = WrapperProvider.playerManagerWrapper.out.players[index].getComponent(Player)!;
          playerCards.push(mePlayer.character!);
        }
        return playerCards;
      // Get all of the chosen player hand cards
      case CHOOSE_CARD_TYPE.MY_HAND:
        return mePlayer!.getHandCards();
      case CHOOSE_CARD_TYPE.PILES:
        return WrapperProvider.pileManagerWrapper.out.getTopCardOfPiles()
      case CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND:
        return spesificPlayer!.getHandCards()
      case CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS_WITHOUT_ETERNALS:
        return spesificPlayer!.getDeskCards().filter(card => { if (!(card.getComponent(Item)!.eternal)) { return true } })
      case CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS:
        return spesificPlayer!.getDeskCards()
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
        cardsToReturn = mePlayer!.getDeskCards().filter(
          card => !card.getComponent(Item)!.eternal
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS:
        cardsToReturn
        players = WrapperProvider.playerManagerWrapper.out.players.map(player => player.getComponent(Player)!)
        for (const player of players) {
          //  let activeItems = player.activeItems.map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })

          cardsToReturn = cardsToReturn.concat(player.getActiveItems(), player.getPassiveItems(), player.getPaidItems()).filter(c => !(player._curses.indexOf(c) >= 0))
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_ACTIVATED_ITEMS:
        players = WrapperProvider.playerManagerWrapper.out.players.map(player => player.getComponent(Player)!)
        for (const player of players) {
          //    let activeItems = player.activeItems.map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
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
          //    let activeItems = player.activeItems.map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //
          cardsToReturn = cardsToReturn.concat(player.soulsLayout!.children)
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_NON_ACTIVATED_ITEMS:
        cardsToReturn
        players = WrapperProvider.playerManagerWrapper.out.players.map(player => player.getComponent(Player)!)
        for (const player of players) {
          //    let activeItems = player.activeItems.map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //
          cardsToReturn = cardsToReturn.concat(player.getActiveItems().filter(item => {
            if (!item.getComponent(Item)!.needsRecharge) {
              return true
            }

          }))
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_ITEMS:
        cardsToReturn = mePlayer!.getDeskCards().filter(
          card => !card.getComponent(Item)!.eternal
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_ACTIVATED_ITEMS:
        cardsToReturn = mePlayer!.getDeskCards().filter(
          card => card.getComponent(Item)!.needsRecharge
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_NON_ACTIVATED_ITEMS:
        cardsToReturn = mePlayer!.getDeskCards().filter(
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
        return mePlayer!._curses
      case CHOOSE_CARD_TYPE.ALL_CURSES:
        WrapperProvider.playerManagerWrapper.out.players.forEach(player => { cardsToReturn.concat((player.getComponent(Player)!._curses)) })
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_NON_ETERNAL_ITEMS:
        WrapperProvider.playerManagerWrapper.out.players.forEach(player => {
          cardsToReturn = cardsToReturn.concat((player.getComponent(Player)!.getDeskCards().filter(card => {
            if (!card.getComponent(Item)!.eternal) { return true; }
          }).filter(c => !(player.getComponent(Player)!._curses.indexOf(c) >= 0))))
        })
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.STORE_CARDS:
        return WrapperProvider.storeWrapper.out.getStoreCards();
      default:
        throw new Error("No Choose Card Type Handler");

        break;
    }
  }

  async requireChoosingACard(cardsToChooseFrom: Node[]): Promise<{ cardChosenId: number; playerId: number }> {
    WrapperProvider.actionManagerWrapper.out.inReactionPhase = true;

    const cards = new Set<Node>();
    for (const card of cardsToChooseFrom) {
      if (card != null && card != undefined) { cards.add(card) }
    }
    // const id = this.node.uuid
    let flippedCards: Node[] = []
    cards.forEach(card => {
      WrapperProvider.cardManagerWrapper.out.disableCardActions(card);
      if (card.getComponent(Card)!._isShowingBack) {
        card.getComponent(Card)!.flipCard(false)
        flippedCards.push(card)
      }
      WrapperProvider.cardManagerWrapper.out.makeRequiredForDataCollector(this, card);
    })
    WrapperProvider.cardPreviewManagerWrapper.out.setFalvorText(this.flavorText)

    const cardPlayed = await this.waitForCardToBeChosen();
    WrapperProvider.cardPreviewManagerWrapper.out.setFalvorText("")
    // let cardServerEffect = await WrapperProvider.cardManagerWrapper.out.getCardEffect(cardPlayed, this.playerId)
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
    return { cardChosenId: cardId, playerId: this.playerId! }
  }

  async waitForCardToBeChosen(): Promise<Node> {
    if (this.otherPlayersFlavorText == '') {
      WrapperProvider.announcementLableWrapper.out.showAnnouncement(`Player ${this.playerId} is Choosing Target`, 0, true)
    } else {
      WrapperProvider.announcementLableWrapper.out.showAnnouncement(this.otherPlayersFlavorText, 0, true)
    }
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.CHOOSE_CARD_CARD_CHOSEN, (data: any) => {
        WrapperProvider.announcementLableWrapper.out.hideAnnouncement(true)
        if (data) {
          resolve(this.cardChosen!);
        }
      })
    })
  }
  applyFilterToCards(cards: Node[], filterComponetnt: ChooseCardTypeAndFilter) {
    console.log(filterComponetnt.getFilterString())
    const fn1 = new Function("card", filterComponetnt.getFilterString())
    return cards.filter(fn1 as (x: any) => boolean)
    //cardsToChooseFrom = cardsToChooseFrom.filter()

  }
  makeArrow(cardChosen: Node) {
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    const canvas = WrapperProvider.CanvasNode
    const arrowGfx = find("ArrowGFX", canvas)!
    const canvasTrans = (canvas!.getComponent(UITransform)!);
    const thisCardTrans = (thisCard.getComponent(UITransform)!);
    const arrowOrigin = canvasTrans.convertToNodeSpaceAR(thisCardTrans.convertToWorldSpaceAR(v3(thisCard.position.x + thisCardTrans.width / 2, thisCard.position.x)))
    const chosenTrans = (cardChosen.getComponent(UITransform)!);
    const arrowEndPoint = canvasTrans.convertToNodeSpaceAR(chosenTrans.convertToWorldSpaceAR(v3(cardChosen.position.x - chosenTrans.width / 2, cardChosen.position.x)))
    const graphics = arrowGfx.getComponent(Graphics)!
    console.log(`origin x:${arrowOrigin.x} y:${arrowOrigin.y}`)
    console.log(`end x:${arrowEndPoint.x} y:${arrowEndPoint.y}`)
    graphics.lineWidth = 60
    graphics.moveTo(arrowOrigin.x, arrowOrigin.y)
    graphics.lineTo(arrowEndPoint.x, arrowEndPoint.y)
    graphics.stroke()
  }
}
