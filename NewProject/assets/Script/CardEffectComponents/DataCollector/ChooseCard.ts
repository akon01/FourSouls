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

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseCard extends DataCollector {
  collectorName = "ChooseCard";
  isEffectChosen: boolean = false;
  cardChosen: cc.Node;
  playerId: number;

  // private _isCardChosen: boolean = false;

  set isCardChosen(boolean: boolean) {
    whevent.emit(GAME_EVENTS.CHOOSE_CARD_CARD_CHOSEN, boolean)
  }

  @property
  multiType: boolean = false;

  @property({
    type: cc.Enum(CHOOSE_CARD_TYPE), visible: function (this: ChooseCard) {
      if (!this.multiType) { return true }
    }
  })
  chooseType: CHOOSE_CARD_TYPE = CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS;

  @property({
    type: [cc.Enum(CHOOSE_CARD_TYPE)], visible: function (this: ChooseCard) {
      if (this.multiType) { return true }
    }
  })
  chooseTypes: CHOOSE_CARD_TYPE[] = []

  @property
  flavorText: string = ""

  /**
   *  @throws when there are no cards to choose from in the choose type
   * @param data cardPlayerId:Player who played the card
   * @returns {target:cc.node of the player who played the card}
   */

  async collectData(data: {
    cardPlayerId;
  }): Promise<EffectTarget> {
    const player = PlayerManager.getPlayerById(data.cardPlayerId)
    this.playerId = data.cardPlayerId;
    //  let cardsToChooseFrom: Set<cc.Node> = new Set()
    const cardsToChooseFrom: cc.Node[] = []
    if (this.multiType) {
      for (const type of this.chooseTypes) {
        const tempCards = this.getCardsToChoose(type, player)
        if (tempCards) {
          tempCards.forEach(card => {
            if (card) { cardsToChooseFrom.push(card) }
          })
        }
        //cardToChooseFrom.add(tempCards)
        //  cardsToChooseFrom = cardsToChooseFrom.concat(this.getCardsToChoose(type, player))

      }
    } else {
      this.getCardsToChoose(this.chooseType, player).forEach(card => {
        if (card) { cardsToChooseFrom.push(card) }
      });
    }
    if (cardsToChooseFrom.length == 0) {
      throw new Error("No Cards To Choose From!")
    }
    if (cardsToChooseFrom.length == 1) {
      return new EffectTarget(cardsToChooseFrom[0])
    }
    const cardChosenData: {
      cardChosenId: number;
      playerId: number;
    } = await this.requireChoosingACard(cardsToChooseFrom);
    const target = new EffectTarget(CardManager.getCardById(cardChosenData.cardChosenId, true))
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
          player
        );
        break;
      case CARD_TYPE.TREASURE:
        cardsToChooseFrom = this.getCardsToChoose(
          CHOOSE_CARD_TYPE.STORE_PLACES,
          player
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

  getCardsToChoose(chooseType: CHOOSE_CARD_TYPE, mePlayer?: Player, player?: Player) {
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
        return mePlayer.handCards;
        break;
      case CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND:
        return player.handCards
      case CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS_WITHOUT_ETERNALS:
        return player.deskCards.filter(card => { if (!(card.getComponent(Item).eternal)) { return true } })
      case CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS:
        return player.deskCards
      case CHOOSE_CARD_TYPE.DECKS:
        cardsToReturn = CardManager.getAllDecks();
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MONSTER_PLACES:
        const monsterPlaces = MonsterField.activeMonsters;
        return monsterPlaces;
      case CHOOSE_CARD_TYPE.NON_ATTACKED_ACTIVE_MONSTERS:
        return MonsterField.activeMonsters.filter(monster => {
          if (BattleManager.currentlyAttackedMonsterNode != monster || Stack._currentStack.findIndex(se => {
            if (se instanceof ActivateItem &&
              se.itemToActivate.getComponent(Monster) != null &&
              se.itemToActivate == monster) {
              return true
            }
          }) != -1) { return true }
        })

      case CHOOSE_CARD_TYPE.MY_NON_ETERNALS:
        cardsToReturn = mePlayer.deskCards.filter(
          card => !card.getComponent(Item).eternal
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS:
        cardsToReturn
        players = PlayerManager.players.map(player => player.getComponent(Player))
        for (const player of players) {
          //    let activeItems = player.activeItems.map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //
          cardsToReturn = cardsToReturn.concat(player.activeItems, player.passiveItems)
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_ACTIVATED_ITEMS:

        players = PlayerManager.players.map(player => player.getComponent(Player))
        for (const player of players) {
          //    let activeItems = player.activeItems.map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //
          cardsToReturn = cardsToReturn.concat(player.activeItems.filter(item => {
            if (item.getComponent(Item).activated) {
              return true
            }

          }))
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_SOUL_CARDS:
        players = PlayerManager.players.map(player => player.getComponent(Player))
        for (const player of players) {
          //    let activeItems = player.activeItems.map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //
          cardsToReturn = cardsToReturn.concat(player.soulsLayout.children)
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_NON_ACTIVATED_ITEMS:
        cardsToReturn
        players = PlayerManager.players.map(player => player.getComponent(Player))
        for (const player of players) {
          //    let activeItems = player.activeItems.map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //
          cardsToReturn = cardsToReturn.concat(player.activeItems.filter(item => {
            if (!item.getComponent(Item).activated) {
              return true
            }

          }))
        }
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_ITEMS:
        cardsToReturn = mePlayer.deskCards.filter(
          card => !card.getComponent(Item).eternal
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_ACTIVATED_ITEMS:
        cardsToReturn = mePlayer.deskCards.filter(
          card => card.getComponent(Item).activated
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_NON_ACTIVATED_ITEMS:
        cardsToReturn = mePlayer.deskCards.filter(
          card => !card.getComponent(Item).activated
        );
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.PLAYERS_AND_ACTIVE_MONSTERS:
        playerCards = [];
        for (let index = 0; index < PlayerManager.players.length; index++) {
          mePlayer = PlayerManager.players[index].getComponent(Player);
          playerCards.push(mePlayer.character);
        }
        cardsToReturn = MonsterField.activeMonsters.concat(playerCards);

        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MY_CURSES:
        return mePlayer._curses
      case CHOOSE_CARD_TYPE.ALL_CURSES:
        PlayerManager.players.forEach(player => { cardsToReturn.concat((player.getComponent(Player)._curses)) })
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.ALL_PLAYERS_NON_ETERNAL_ITEMS:
        PlayerManager.players.forEach(player => {
          cardsToReturn = cardsToReturn.concat((player.getComponent(Player).deskCards.filter(card => {
            if (!card.getComponent(Item).eternal) { return true; }
          })))
        })
        cc.error(cardsToReturn)
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.STORE_CARDS:
        return Store.storeCards;
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

    cc.log(cards)
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
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.CHOOSE_CARD_CARD_CHOSEN, (data) => {
        if (data) {
          resolve(this.cardChosen);
        }
      })
    })
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
    graphics.lineWidth = 60
    graphics.moveTo(arrowOrigin.x, arrowOrigin.y)
    graphics.lineTo(arrowEndPoint.x, arrowEndPoint.y)
    graphics.stroke()
  }
}
