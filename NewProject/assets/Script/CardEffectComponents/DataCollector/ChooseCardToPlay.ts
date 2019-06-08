import { PlayCardAction } from "./../../Entites/Action";
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
import { ServerCardEffect } from "../../Entites/ServerCardEffect";
import CardManager from "../../Managers/CardManager";
import DataCollector from "./DataCollector";
import Effect from "../CardEffects/Effect";
import PlayLootCard from "../CardEffects/PlayLootCard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseCardToPlay extends DataCollector {
  collectorName = "ChooseCardToPlay";
  isCardChosen: boolean = false;
  cardChosen: cc.Node;
  playerId: number;

  /**
   *
   * @param data cardPlayerId:Player who played the card
   * @returns {target:cc.node of the player who played the card}
   */
  @printMethodStarted(COLORS.LIGHTRED)
  async collectData(data): Promise<{ cardPlayedId: number; playerId: number }> {
    let player = PlayerManager.getPlayerById(data.cardPlayerId).getComponent(
      Player
    );
    this.playerId = data.cardPlayerId;
    //what cards to choose from
    let chooseType = this.node.parent.getComponent(Effect).chooseType;
    let cardsToChooseFrom = this.getCardsToChoose(chooseType, player);
    cc.log(cardsToChooseFrom);
    let cardPlayedData = await this.requireChoosingACard(cardsToChooseFrom);
    return cardPlayedData;
  }

  @printMethodStarted(COLORS.LIGHTRED)
  getCardsToChoose(chooseType: CHOOSE_TYPE, player: Player) {
    switch (chooseType) {
      case CHOOSE_TYPE.PLAYER:
        let playerCards: cc.Node[] = [];
        for (let index = 0; index < PlayerManager.players.length; index++) {
          const player = PlayerManager.players[index].getComponent(Player);
          playerCards.push(player.character);
        }
        return playerCards;
        break;
      case CHOOSE_TYPE.PLAYERHAND:
        return player.hand.layoutCards;
        break;
      default:
        break;
    }
  }

  async requireChoosingACard(
    cards: cc.Node[]
  ): Promise<{ cardPlayedId: number; playerId: number }> {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      CardManager.disableCardActions(card);
      CardManager.makeRequiredForDataCollector(this, card);
    }
    cc.log("select a card!");
    let cardPlayed = await this.waitForCardPlay();
    cc.log("card played " + cardPlayed.name);
    //   let cardServerEffect = await CardManager.getCardEffect(cardPlayed,this.playerId)
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      CardManager.unRequiredForDataGather(card);
    }
    let cardId = cardPlayed.getComponent(Card).cardId;

    return new Promise((resolve, reject) => {
      resolve({ cardPlayedId: cardId, playerId: this.playerId });
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
