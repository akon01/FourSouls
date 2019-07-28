import MonsterField from "./../../Entites/MonsterField";
import { MoveLootToPile } from "./../../Entites/Action";
import {
  CHOOSE_TYPE,

  COLORS,
  CARD_TYPE
} from "./../../Constants";

import { COLLECTORTYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";

import { ServerEffect } from "../../Entites/ServerCardEffect";
import CardManager from "../../Managers/CardManager";
import DataCollector from "./DataCollector";
import Effect from "../CardEffects/Effect";
import PlayLootCard from "../CardEffects/PlayLootCard";
import Player from "../../Entites/GameEntities/Player";
import Deck from "../../Entites/GameEntities/Deck";
import Card from "../../Entites/GameEntities/Card";
import Item from "../../Entites/CardTypes/Item";
import ActionManager from "../../Managers/ActionManager";
import Condition from "../CardConditions/Condition";
import { EffectTarget } from "../../Managers/DataInterpreter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseCard extends DataCollector {
  collectorName = "ChooseCard";
  isCardChosen: boolean = false;
  cardChosen: cc.Node;
  playerId: number;

  @property({ type: cc.Enum(CHOOSE_TYPE) })
  chooseType: CHOOSE_TYPE = CHOOSE_TYPE.ALLPLAYERSITEMS;

  /**
   *
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
    let cardsToChooseFrom = this.getCardsToChoose(this.chooseType, player);
    cc.log(cardsToChooseFrom.map(card => card.name))
    let cardChosenData: {
      cardChosenId: number;
      playerId: number;
    } = await this.requireChoosingACard(cardsToChooseFrom);
    cc.log(cardChosenData.cardChosenId)
    cc.log(CardManager.treasureDeck.getComponent(Deck)._cardId)
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
          CHOOSE_TYPE.MONSTERPLACES,
          player
        );
        break;
      case CARD_TYPE.TREASURE:
        cardsToChooseFrom = this.getCardsToChoose(
          CHOOSE_TYPE.STOREPLACES,
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

  getCardsToChoose(chooseType: CHOOSE_TYPE, mePlayer?: Player, player?: Player) {
    let cardsToReturn: cc.Node[] = [];
    let players
    switch (chooseType) {
      //Get all available player char cards
      case CHOOSE_TYPE.PLAYERS:
        let playerCards: cc.Node[] = [];
        for (let index = 0; index < PlayerManager.players.length; index++) {
          mePlayer = PlayerManager.players[index].getComponent(Player);
          playerCards.push(mePlayer.character);
        }
        return playerCards;
        break;
      // Get all of the chosen player hand cards
      case CHOOSE_TYPE.MYHAND:
        return mePlayer.handCards;
        break;
      case CHOOSE_TYPE.SPECIPICPLAYERHAND:
        return player.handCards
      case CHOOSE_TYPE.DECKS:
        cardsToReturn = CardManager.getAllDecks();
        return cardsToReturn;
      case CHOOSE_TYPE.MONSTERPLACES:
        let monsterPlaces = MonsterField.activeMonsters;
        return monsterPlaces;
      case CHOOSE_TYPE.PLAYERNONETERNALS:
        cardsToReturn = mePlayer.deskCards.filter(
          card => !card.getComponent(Item).eternal
        );
        return cardsToReturn;
      case CHOOSE_TYPE.ALLPLAYERSITEMS:
        cardsToReturn
        players = PlayerManager.players.map(player => player.getComponent(Player))
        for (const player of players) {
          //    let activeItems = player.activeItems.map(activeItem => { if (activeItem.getComponent(Item).activated) return activeItem })
          //  
          cardsToReturn = cardsToReturn.concat(player.activeItems)
        }
        return cardsToReturn;
      case CHOOSE_TYPE.ALLPLAYERSACTIVATEDITEMS:
        cardsToReturn

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
      case CHOOSE_TYPE.ALLPLAYERSNONACTIVATEDITEMS:
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
      case CHOOSE_TYPE.PLAYERITEMS:
        cardsToReturn = mePlayer.deskCards.filter(
          card => !card.getComponent(Item).eternal
        );
        return cardsToReturn;
      case CHOOSE_TYPE.PLAYERACTIVATEDITEMS:
        cardsToReturn = mePlayer.deskCards.filter(
          card => card.getComponent(Item).activated
        );
        return cardsToReturn;
      case CHOOSE_TYPE.PLAYERNONACTIVATEDITEMS:
        cardsToReturn = mePlayer.deskCards.filter(
          card => !card.getComponent(Item).activated
        );
        return cardsToReturn;
      case CHOOSE_TYPE.PLAYERSANDACTIVEMONSTERS:
        playerCards = [];
        for (let index = 0; index < PlayerManager.players.length; index++) {
          mePlayer = PlayerManager.players[index].getComponent(Player);
          playerCards.push(mePlayer.character);
        }
        cardsToReturn = MonsterField.activeMonsters.concat(playerCards);

        return cardsToReturn;
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
      cc.log(card)
      CardManager.disableCardActions(card);
      CardManager.makeRequiredForDataCollector(this, card);
    }
    let cardPlayed = await this.waitForCardToBeChosen();
    //   let cardServerEffect = await CardManager.getCardEffect(cardPlayed,this.playerId)
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      CardManager.unRequiredForDataCollector(card);
      CardManager.disableCardActions(card);
    }
    let cardId;
    if (cardPlayed.getComponent(Deck) == null) {
      cardId = cardPlayed.getComponent(Card)._cardId;
    } else {
      cardId = cardPlayed.getComponent(Deck)._cardId;
    }
    ActionManager.inReactionPhase = false;
    return new Promise((resolve, reject) => {
      resolve({ cardChosenId: cardId, playerId: this.playerId });
    });
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
