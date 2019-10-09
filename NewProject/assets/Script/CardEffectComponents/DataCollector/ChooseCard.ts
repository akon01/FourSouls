import Item from "../../Entites/CardTypes/Item";
import Card from "../../Entites/GameEntities/Card";
import Deck from "../../Entites/GameEntities/Deck";
import Player from "../../Entites/GameEntities/Player";
import ActionManager from "../../Managers/ActionManager";
import CardManager from "../../Managers/CardManager";
import { EffectTarget } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import { CARD_TYPE, CHOOSE_CARD_TYPE } from "./../../Constants";
import MonsterField from "./../../Entites/MonsterField";
import DataCollector from "./DataCollector";
import Store from "../../Entites/GameEntities/Store";
import BattleManager from "../../Managers/BattleManager";



const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseCard extends DataCollector {
  collectorName = "ChooseCard";
  isEffectChosen: boolean = false;
  cardChosen: cc.Node;
  playerId: number;

  isCardChosen: boolean = false;


  @property
  multiType: boolean = false;


  @property({
    type: cc.Enum(CHOOSE_CARD_TYPE), visible: function (this: ChooseCard) {
      if (!this.multiType) return true
    }
  })
  chooseType: CHOOSE_CARD_TYPE = CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS;

  @property({
    type: [cc.Enum(CHOOSE_CARD_TYPE)], visible: function (this: ChooseCard) {
      if (this.multiType) return true
    }
  })
  chooseTypes: CHOOSE_CARD_TYPE[] = []

  /**
   *  @throws when there are no cards to choose from in the choose type
   * @param data cardPlayerId:Player who played the card
   * @returns {target:cc.node of the player who played the card}
   */

  async collectData(data: {
    cardPlayerId;
  }): Promise<EffectTarget> {
    let player = PlayerManager.getPlayerById(data.cardPlayerId).getComponent(
      Player
    );
    this.playerId = data.cardPlayerId;
    let cardsToChooseFrom: cc.Node[] = []
    if (this.multiType) {
      for (const type of this.chooseTypes) {
        cardsToChooseFrom = cardsToChooseFrom.concat(this.getCardsToChoose(type, player))
      }
    } else {
      cardsToChooseFrom = this.getCardsToChoose(this.chooseType, player);
    }
    if (cardsToChooseFrom.length == 0) {
      throw 'No Cards To Choose From!'
    }
    let cardChosenData: {
      cardChosenId: number;
      playerId: number;
    } = await this.requireChoosingACard(cardsToChooseFrom);
    let target = new EffectTarget(CardManager.getCardById(cardChosenData.cardChosenId, true))
    cc.log(`chosen ${target.effectTargetCard.name}`)
    return target;
  }

  async collectDataOfPlaces(data: {
    cardPlayerId;
    deckType;
  }): Promise<{
    cardChosenId: number;
    playerId: number;
  }> {
    let player = PlayerManager.getPlayerById(data.cardPlayerId).getComponent(
      Player
    );
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
    let cardChosenData: {
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
        return player.deskCards.filter(card => { if (!(card.getComponent(Item).eternal)) return true })
      case CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS:
        return player.deskCards
      case CHOOSE_CARD_TYPE.DECKS:
        cardsToReturn = CardManager.getAllDecks();
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.MONSTER_PLACES:
        let monsterPlaces = MonsterField.activeMonsters;
        return monsterPlaces;
      case CHOOSE_CARD_TYPE.NON_ATTACKED_ACTIVE_MONSTERS:
        return MonsterField.activeMonsters.filter(monster => {
          if (BattleManager.currentlyAttackedMonsterNode != monster) return true
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
          cardsToReturn = cardsToReturn.concat(player.activeItems)
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
          cardsToReturn.concat((player.getComponent(Player).deskCards.filter(card => {
            if (!card.getComponent(Item).eternal) return true;
          })))
        })
        return cardsToReturn;
      case CHOOSE_CARD_TYPE.STORE_CARDS:
        return Store.storeCards;
      default:
        break;
    }
  }

  async requireChoosingACard(
    cards: cc.Node[]
  ): Promise<{ cardChosenId: number; playerId: number }> {
    ActionManager.inReactionPhase = true;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      CardManager.disableCardActions(card);
      CardManager.makeRequiredForDataCollector(this, card);
    }
    let cardPlayed = await this.waitForCardToBeChosen();
    //   let cardServerEffect = await CardManager.getCardEffect(cardPlayed,this.playerId)
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      CardManager.unRequiredForDataCollector(card);
      //  CardManager.disableCardActions(card);
    }
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
      let timesChecked = 0;
      let check = () => {
        if (this.isCardChosen == true) {
          this.isCardChosen = false;
          resolve(this.cardChosen);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
  }
}
