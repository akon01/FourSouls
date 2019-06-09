import { MoveLootToPile } from "./../../Entites/Action";
import {
  CHOOSE_TYPE,
  printMethodStarted,
  COLORS,
  CARD_TYPE
} from "./../../Constants";

import { COLLECTORTYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";
import Player from "../../Entites/Player";

import Card from "../../Entites/Card";
import { ServerEffect } from "../../Entites/ServerCardEffect";
import CardManager from "../../Managers/CardManager";
import DataCollector from "./DataCollector";
import Effect from "../CardEffects/Effect";
import PlayLootCard from "../CardEffects/PlayLootCard";
import Deck from "../../Entites/Deck";

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

  async collectData(
    data
  ): Promise<{
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

  getCardsToChoose(chooseType: CHOOSE_TYPE, player: Player) {
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
        return player.hand.layoutCards;
        break;
      case CHOOSE_TYPE.DECKS:
        let allDecks = CardManager.getAllDecks();
        return allDecks;
      default:
        break;
    }
  }

  async requireChoosingACard(
    cards: cc.Node[]
  ): Promise<{ cardChosenId: number; playerId: number }> {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      CardManager.disableCardActions(card);
      CardManager.makeRequiredForDataCollector(this, card);
    }
    cc.log("select a card!");
    let cardPlayed = await this.waitForCardPlay();
    cc.log("card selected " + cardPlayed.name);
    //   let cardServerEffect = await CardManager.getCardEffect(cardPlayed,this.playerId)
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      CardManager.unRequiredForDataGather(card);
    }
    let cardId;
    if (cardPlayed.getComponent(Deck) == null) {
      cardId = cardPlayed.getComponent(Card).cardId;
    } else {
      cardId = cardPlayed.getComponent(Deck).cardId;
    }

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
      setTimeout(check, 50);
    });
  }
}