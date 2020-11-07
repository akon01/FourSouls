import Item from "../../Entites/CardTypes/Item";
import Card from "../../Entites/GameEntities/Card";
import Deck from "../../Entites/GameEntities/Deck";
import Player from "../../Entites/GameEntities/Player";
import Store from "../../Entites/GameEntities/Store";
import ActionManager from "../../Managers/ActionManager";
import BattleManager from "../../Managers/BattleManager";
import CardManager from "../../Managers/CardManager";
import { EffectTarget } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import { CARD_TYPE, CHOOSE_CARD_TYPE, GAME_EVENTS } from "./../../Constants";
import MonsterField from "./../../Entites/MonsterField";
import DataCollector from "./DataCollector";
import Stack from "../../Entites/Stack";
import ActivateItem from "../../StackEffects/Activate Item";
import Monster from "../../Entites/CardTypes/Monster";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import DecisionMarker from "../../Entites/Decision Marker";
import ChooseCardTypeAndFilter from "../ChooseCardTypeAndFilter";
import { whevent } from "../../../ServerClient/whevent";
import AnnouncementLable from "../../LableScripts/Announcement Lable";
import GetTargetFromPassiveMeta from "./GetTargetFromPassiveMeta";
import PileManager from "../../Managers/PileManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseCard extends DataCollector {
  collectorName = "ChooseCard";
  cardChosen: cc.Node;
  playerId: number;

  // private _isCardChosen: boolean = false;

  setIsCardChosen(boolean: boolean) {
    this.isCardChosen = boolean;
    whevent.emit(GAME_EVENTS.CHOOSE_CARD_CARD_CHOSEN, boolean)
  }


  @property
  multiType: boolean = false;

  @property({ visible: false })
  otherPlayer: Player = null

  @property
  isChooseFromPreviewManager: boolean = false

  @property({
    type: ChooseCardTypeAndFilter, visible: function (this: ChooseCard) {
      if (!this.multiType) { return true }
    }
  })
  chooseType: ChooseCardTypeAndFilter = null;

  @property({
    type: [ChooseCardTypeAndFilter], visible: function (this: ChooseCard) {
      if (this.multiType) { return true }
    }
  })
  chooseTypes: ChooseCardTypeAndFilter[] = []

  @property
  filterFromPassiveMeta: boolean = false;

  @property({
    visible: function (this: ChooseCard) {
      if (this.filterFromPassiveMeta) { return true }
    }
    , type: GetTargetFromPassiveMeta
  })
  targetCollectorFromPassiveMeta: GetTargetFromPassiveMeta = null


  @property
  flavorText: string = ""

  @property
  otherPlayersFlavorText: string = ''

  @property
  isMultiCardChoice: boolean = false;

  @property({
    visible: function (this: ChooseCard) {
      if (this.isMultiCardChoice) return true
    }
  })
  numOfCardsToChoose: number = 1


  /**
   *  @throws when there are no cards to choose from in the choose type
   * @param data cardPlayerId:Player who played the card
   * @returns {target:cc.node of the player who played the card}
   */

  async collectData(data: { cardPlayerId }): Promise<any> {
    const player = PlayerManager.getPlayerById(data.cardPlayerId)
    this.playerId = data.cardPlayerId;

    let cardsToChooseFrom: cc.Node[] = []
    if (this.multiType) {
      for (const filterComp of this.chooseTypes) {
        let tempCards = this.getCardsToChoose(filterComp.chooseType, player, this.otherPlayer)
        if (tempCards) {
          if (filterComp.applyFilter) {
            tempCards = this.applyFilterToCards(tempCards, filterComp);
          }
          tempCards.forEach(card => {
            if (card) { cardsToChooseFrom.push(card) }
          })
        }
        //cardToChooseFrom.add(tempCards)
        //  cardsToChooseFrom = cardsToChooseFrom.concat(this.getCardsToChoose(type, player))

      }
    } else {
      this.getCardsToChoose(this.chooseType.chooseType, player, this.otherPlayer).forEach(card => {
        if (card) { cardsToChooseFrom.push(card) }
      });
      if (this.chooseType.applyFilter) {
        cardsToChooseFrom = this.applyFilterToCards(cardsToChooseFrom, this.chooseType);
      }
    }
    if (this.filterFromPassiveMeta) {
      const target = this.targetCollectorFromPassiveMeta.collectData(null)
      if (target) {
        cardsToChooseFrom = cardsToChooseFrom.filter(card => card != target.effectTargetCard)
      }
    }
    if (cardsToChooseFrom.length == 0) {
      throw new Error("No Cards To Choose From!")
    }
    if (cardsToChooseFrom.length == 1) {
      if (this.node) {
        await DecisionMarker.$.showDecision(Card.getCardNodeByChild(this.node), cardsToChooseFrom[0], true)
      }
      return new EffectTarget(cardsToChooseFrom[0])
    }

    if (this.isMultiCardChoice) {
      let chosenCards: EffectTarget[] = []
      if (this.isChooseFromPreviewManager) {
        chosenCards = (await CardPreviewManager.selectFromCards(cardsToChooseFrom, this.numOfCardsToChoose)).map(e => new EffectTarget(e))
      } else {
        for (let i = 0; i < this.numOfCardsToChoose; i++) {
          cardsToChooseFrom = cardsToChooseFrom.filter(card => !chosenCards.map(target => target.effectTargetCard).includes(card))

          chosenCards.push(await this.getCardTargetFromPlayer(cardsToChooseFrom))
        }
      }
      return chosenCards
    } else {
      if (this.isChooseFromPreviewManager) {
        return (await CardPreviewManager.selectFromCards(cardsToChooseFrom, 1)).map(e => new EffectTarget(e))
      } else {
        return await this.getCardTargetFromPlayer(cardsToChooseFrom);
      }
    }

  }

  private async getCardTargetFromPlayer(cardsToChooseFrom: cc.Node[]) {

    const cardChosenData: {
      cardChosenId: number;
      playerId: number;
    } = await this.requireChoosingACard(cardsToChooseFrom);
    const target = new EffectTarget(CardManager.getCardById(cardChosenData.cardChosenId, true));
    return target;
  }

  async collectDataOfPlaces(data: {
    cardPlayerId;
    deckType;
  }): Promise<{
    cardChosenId: number;
    playerId: number;
  }> {
    const player = PlayerManager.getPlayerById(data.cardPlayerId)
    this.playerId = data.cardPlayerId;
    //what cards to choose from
    let cardsToChooseFrom;
    switch (data.deckType) {
      case CARD_TYPE.MONSTER:
        cardsToChooseFrom = this.getCardsToChoose(
          CHOOSE_CARD_TYPE.MONSTER_PLACES,
          player, this.otherPlayer
        );
        break;
      case CARD_TYPE.TREASURE:
        cardsToChooseFrom = this.getCardsToChoose(
          CHOOSE_CARD_TYPE.STORE_PLACES,
          player, this.otherPlayer
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

  getCardsToChoose(chooseType: CHOOSE_CARD_TYPE, mePlayer?: Player, spesificPlayer?: Player) {
    let cardsToReturn: cc.Node[] = [];
    let players: Player[]
    switch (chooseType) {
      //Get all available player char cards
      case CHOOSE_CARD_TYPE.ALL_PLAYERS:
        let playerCards: cc.Node[] = [];
        for (let index = 0; index < PlayerManager.players.length; index++) {
          mePlayer = PlayerManager.players[index].getComponent(Player);
          playerCards.push(mePlayer.character);
        }
        return playerCards;

      // Get all of the chosen player hand cards
      case CHOOSE_CARD_TYPE.MY_HAND:
        return mePlayer.getHandCards();
      case CHOOSE_CARD_TYPE.PILES:
        return PileManager.getTopCardOfPiles()
      case CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND:
        return spesificPlayer.getHandCards()
      case CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS_WITHOUT_ETERNALS:
        return spesificPlayer.getDeskCards().filter(card => { if (!(card.getComponent(Item).eternal)) { return true } })
      case CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS:
        return spesificPlayer.getDeskCards()
      case CHOOSE_CARD_TYPE.DECKS:
        cardsToReturn = CardManager.getAllDecks();
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MONSTER_PLACES:
        const monsterPlaces = MonsterField.getActiveMonsters();
        return monsterPlaces;
      case CHOOSE_CARD_TYPE.NON_ATTACKED_ACTIVE_MONSTERS:
        return MonsterField.getActiveMonsters().filter(monster => {
          if (BattleManager.currentlyAttackedMonsterNode != monster || Stack._currentStack.findIndex(se => {
            if (se instanceof ActivateItem &&
              se.itemToActivate.getComponent(Monster) != null &&
              se.itemToActivate == monster) {
              return true
            }
          }) != -1) { return true }
        })

      case CHOOSE_CARD_TYPE.MY_NON_ETERNALS:
        cardsToReturn = mePlayer.getDeskCards().filter(
          card => !card.getComponent(Item).eternal
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS:
        cardsToReturn
        players = PlayerManager.players.map(player => player.getComponent(Player))
        for (const player of players) {
          //    let activeItems = player.getActiveItems().map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //  
          cardsToReturn = cardsToReturn.concat(player.getActiveItems(), player.getPassiveItems(), player.getPaidItems()).filter(c => !player._curses.includes(c))
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_ACTIVATED_ITEMS:

        players = PlayerManager.players.map(player => player.getComponent(Player))
        for (const player of players) {
          //    let activeItems = player.getActiveItems().map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //
          cardsToReturn = cardsToReturn.concat(player.getActiveItems().filter(item => {
            if (item.getComponent(Item).needsRecharge) {
              return true
            }

          }))
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_SOUL_CARDS:
        players = PlayerManager.players.map(player => player.getComponent(Player))
        for (const player of players) {
          //    let activeItems = player.getActiveItems().map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //
          cardsToReturn = cardsToReturn.concat(player.soulsLayout.children)
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_NON_ACTIVATED_ITEMS:
        cardsToReturn
        players = PlayerManager.players.map(player => player.getComponent(Player))
        for (const player of players) {
          //    let activeItems = player.getActiveItems().map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //
          cardsToReturn = cardsToReturn.concat(player.getActiveItems().filter(item => {
            if (!item.getComponent(Item).needsRecharge) {
              return true
            }

          }))
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_ITEMS:
        cardsToReturn = mePlayer.getDeskCards().filter(
          card => !card.getComponent(Item).eternal
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_ACTIVATED_ITEMS:
        cardsToReturn = mePlayer.getDeskCards().filter(
          card => card.getComponent(Item).needsRecharge
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_NON_ACTIVATED_ITEMS:
        cardsToReturn = mePlayer.getDeskCards().filter(
          card => !card.getComponent(Item).needsRecharge
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.PLAYERS_AND_ACTIVE_MONSTERS:
        playerCards = [];
        for (let index = 0; index < PlayerManager.players.length; index++) {
          mePlayer = PlayerManager.players[index].getComponent(Player);
          playerCards.push(mePlayer.character);
        }
        cardsToReturn = MonsterField.getActiveMonsters().concat(playerCards);

        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_CURSES:
        return mePlayer._curses
      case CHOOSE_CARD_TYPE.ALL_CURSES:
        PlayerManager.players.forEach(player => { cardsToReturn.concat((player.getComponent(Player)._curses)) })
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_NON_ETERNAL_ITEMS:
        PlayerManager.players.forEach(player => {
          const playerComp = player.getComponent(Player);
          cardsToReturn = cardsToReturn.concat((playerComp.getDeskCards().filter(card => {
            if (!card.getComponent(Item).eternal) { return true; }
          }).filter(c => !playerComp._curses.includes(c))))
        })
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.OTHER_PLAYERS_NON_ETERNAL_ITEMS:
        PlayerManager.players.forEach(player => {
          const playerComp = player.getComponent(Player);
          if (playerComp.me) { return }
          cardsToReturn = cardsToReturn.concat((playerComp.getDeskCards().filter(card => {
            if (!card.getComponent(Item).eternal) { return true; }
          }).filter(c => !playerComp._curses.includes(c))))
        })
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.STORE_CARDS:
        return Store.getStoreCards();
      case CHOOSE_CARD_TYPE.IN_TREASURE_DECK_GUPPY_ITEMS:
        var x = CardManager.treasureDeck.getComponent(Deck).getCards().filter(e => e.getComponent(Item).isGuppyItem)
        return x
      case CHOOSE_CARD_TYPE.MOST_SOULS_PLAYERS:
        players = PlayerManager.players.map(p => p.getComponent(Player))
        let mostSoulsPlayers: Player[] = []
        players.forEach(player => {
          mostSoulsPlayers = mostSoulsPlayers.filter(p => p.souls >= player.souls)
          if (mostSoulsPlayers.length == 0 || mostSoulsPlayers.some(p => p.souls == player.souls)) {
            mostSoulsPlayers.push(player)
          }
        })
        return mostSoulsPlayers.map(p => p.character)
      default:
        break;
    }
  }

  async requireChoosingACard(cardsToChooseFrom: cc.Node[]): Promise<{ cardChosenId: number; playerId: number }> {
    ActionManager.inReactionPhase = true;

    const cards = new Set<cc.Node>();
    for (const card of cardsToChooseFrom) {
      if (card != null && card != undefined) { cards.add(card) }
    }
    // const id = this.node.uuid
    let flippedCards: cc.Node[] = []
    cards.forEach(card => {
      CardManager.disableCardActions(card);
      if (card.getComponent(Card)._isFlipped) {
        card.getComponent(Card).flipCard(false)
        flippedCards.push(card)
      }
      CardManager.makeRequiredForDataCollector(this, card);
    })
    CardPreviewManager.setFalvorText(this.flavorText)
    // for (let i = 0; i < cards.size; i++) {
    //   const card = cards[i];

    // }
    const cardPlayed = await this.waitForCardToBeChosen();
    CardPreviewManager.setFalvorText("")
    //   let cardServerEffect = await CardManager.getCardEffect(cardPlayed,this.playerId)
    cards.forEach(async card => {
      await CardManager.unRequiredForDataCollector(card);
    })
    if (this.node) {
      await DecisionMarker.$.showDecision(Card.getCardNodeByChild(this.node), cardPlayed, true)
    }
    flippedCards.forEach(card => card.getComponent(Card).flipCard(false))
    // for (let i = 0; i < cards.size; i++) {
    //   const card = cards[i];
    //   //  CardManager.disableCardActions(card);
    // }
    let cardId;
    if (cardPlayed.getComponent(Deck) == null) {
      cardId = cardPlayed.getComponent(Card)._cardId;
    } else {
      cardId = cardPlayed.getComponent(Deck)._cardId;
    }
    ActionManager.inReactionPhase = false;
    return { cardChosenId: cardId, playerId: this.playerId }
  }

  async waitForCardToBeChosen(): Promise<cc.Node> {
    if (this.otherPlayersFlavorText == '') {
      AnnouncementLable.$.showAnnouncement(`Player ${this.playerId} is Choosing Target`, 0, true)
    } else {
      AnnouncementLable.$.sendToServerShowAnnouncment(this.otherPlayersFlavorText)
    }
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.CHOOSE_CARD_CARD_CHOSEN, (data) => {
        AnnouncementLable.$.hideAnnouncement(true)
        if (data) {
          resolve(this.cardChosen);
        }
      })
    })
  }

  applyFilterToCards(cards: cc.Node[], filterComponetnt: ChooseCardTypeAndFilter) {
    cc.log(filterComponetnt.getFilterString())
    const fn1 = new Function("card", filterComponetnt.getFilterString())
    return cards.filter(fn1 as (x) => boolean)
    //cardsToChooseFrom = cardsToChooseFrom.filter()

  }

  makeArrow(cardChosen: cc.Node) {
    const thisCard = Card.getCardNodeByChild(this.node);
    const canvas = cc.find("Canvas")
    const arrowGfx = cc.find("Canvas/ArrowGFX")
    const arrowOrigin = canvas.convertToNodeSpaceAR(thisCard.convertToWorldSpaceAR(new cc.Vec2(thisCard.x + thisCard.width / 2, thisCard.x)))
    const arrowEndPoint = canvas.convertToNodeSpaceAR(cardChosen.convertToWorldSpaceAR(new cc.Vec2(cardChosen.x - cardChosen.width / 2, cardChosen.x)))
    const graphics = arrowGfx.getComponent(cc.Graphics)
    cc.log(`origin x:${arrowOrigin.x} y:${arrowOrigin.y}`)
    cc.log(`end x:${arrowEndPoint.x} y:${arrowEndPoint.y}`)
    //  graphics.lineWidth = 60
    graphics.moveTo(arrowOrigin.x, arrowOrigin.y)
    graphics.lineTo(arrowEndPoint.x, arrowEndPoint.y)
    graphics.stroke()
  }
}
