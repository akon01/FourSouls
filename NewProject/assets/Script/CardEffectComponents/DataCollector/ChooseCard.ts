import MonsterField from "./../../Entites/MonsterField";
import { MoveLootToPile } from "./../../Entites/Action";
import {
  CHOOSE_TYPE,
  printMethodStarted,
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

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseCard extends DataCollector {
  collectorName = "ChooseCard";
  isCardChosen: boolean = false;
  cardChosen: cc.Node;
  playerId: number;

  /**
   *
   * @param data cardPlayerId:Player who played the card
   * @returns {target:cc.node of the player who played the card}
   */

  async collectData(data: {
    cardPlayerId;
  }): Promise<{
    cardChosenId: number;
    playerId: number;
  }> {
    let player = PlayerManager.getPlayerById(data.cardPlayerId).getComponent(
      Player
    );
    this.playerId = data.cardPlayerId;
    //what cards to choose from
    let chooseType = this.node.parent.getComponent(Effect).chooseType;
    let cardsToChooseFrom = this.getCardsToChoose(chooseType, player);
    let cardChosenData: {
      cardChosenId: number;
      playerId: number;
    } = await this.requireChoosingACard(cardsToChooseFrom);
    return cardChosenData;
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

  getCardsToChoose(chooseType: CHOOSE_TYPE, player?: Player) {
    switch (chooseType) {
      //Get all available player char cards
      case CHOOSE_TYPE.PLAYER:
        let playerCards: cc.Node[] = [];
        for (let index = 0; index < PlayerManager.players.length; index++) {
          const player = PlayerManager.players[index].getComponent(Player);
          playerCards.push(player.character);
        }
        return playerCards;
        break;
      // Get all of the chosen player hand cards
      case CHOOSE_TYPE.PLAYERHAND:
        return player.handCards;
        break;
      case CHOOSE_TYPE.DECKS:
        let allDecks = CardManager.getAllDecks();
        return allDecks;
      case CHOOSE_TYPE.MONSTERPLACES:
        let monsterPlaces = MonsterField.activeMonsters;
        return monsterPlaces;
        break;
      case CHOOSE_TYPE.PLAYERNONETERNALS:
        let nonEternals = player.deskCards.filter(
          card => !card.getComponent(Item).eternal
        );
        return nonEternals;
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
      //cc.log(card.name);
      CardManager.disableCardActions(card);
      CardManager.makeRequiredForDataCollector(this, card);
    }
    let cardPlayed = await this.waitForCardPlay();
    //   let cardServerEffect = await CardManager.getCardEffect(cardPlayed,this.playerId)
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      CardManager.unRequiredForDataCollector(card);
    }
    let cardId;
    if (cardPlayed.getComponent(Deck) == null) {
      cardId = cardPlayed.getComponent(Card).cardId;
    } else {
      cardId = cardPlayed.getComponent(Deck).cardId;
    }
    ActionManager.inReactionPhase = false;
    return new Promise((resolve, reject) => {
      resolve({ cardChosenId: cardId, playerId: this.playerId });
    });
  }

  async waitForCardPlay(): Promise<cc.Node> {
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
