import Signal from "../../../Misc/Signal";
import Card from "../../Entites/GameEntities/Card";
import Player from "../../Entites/GameEntities/Player";
import ActionManager from "../../Managers/ActionManager";
import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import Effect from "../CardEffects/Effect";
import { CHOOSE_TYPE } from "./../../Constants";
import { MoveLootToPile } from "./../../Entites/Action";
import DataCollector from "./DataCollector";
import PileManager from "../../Managers/PileManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SelectLootToPlay extends DataCollector {
  collectorName = "SelectLootToPlay";
  isCardChosen: boolean = false;
  cardChosen: cc.Node;
  playerId: number;

  /**
   *
   * @param data cardPlayerId:Player who played the card
   * @returns {target:cc.node of the player who played the card}
   */

  async collectData(data): Promise<Object> {
    let player = PlayerManager.getPlayerById(data.cardPlayerId).getComponent(
      Player
    );
    this.playerId = data.cardPlayerId;
    //what cards to choose from
    let chooseType = this.node.parent.getComponent(Effect).chooseType;
    let cardsToChooseFrom = this.getCardsToChoose(chooseType, player);
    let cardPlayedData = await this.requireChoosingACard(cardsToChooseFrom);
    let cardPlayed = CardManager.getCardById(cardPlayedData.cardPlayedId);
    let playLootAction = new MoveLootToPile(
      { lootCard: cardPlayed },
      this.playerId
    );
    let serverData = {
      signal: Signal.DISCRADLOOT,
      srvData: { playerId: this.playerId, cardId: cardPlayedData.cardPlayedId }
    };
    await CardManager.moveCardTo(cardPlayed, PileManager.lootCardPileNode, true)
    await ActionManager.showSingleAction(playLootAction, serverData, true);
    cc.log(cardPlayed)
    let cardPlayedServerEffect = await CardManager.getCardEffect(
      cardPlayed,
      this.playerId
    );
    cc.log(cardPlayedServerEffect)
    let collectedData = {
      serverEffect: cardPlayedServerEffect,
      playerId: this.playerId
    };
    cc.log('b4 return the server effect')
    return collectedData.serverEffect;
  }

  getCardsToChoose(chooseType: CHOOSE_TYPE, player: Player) {
    switch (chooseType) {
      case CHOOSE_TYPE.PLAYERS:
        let playerCards: cc.Node[] = [];
        for (let index = 0; index < PlayerManager.players.length; index++) {
          const player = PlayerManager.players[index].getComponent(Player);
          playerCards.push(player.character);
        }
        return playerCards;
        break;
      case CHOOSE_TYPE.MYHAND:
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

    let cardPlayed = await this.waitForCardPlay();

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      CardManager.unRequiredForDataCollector(card);
    }
    let cardId = cardPlayed.getComponent(Card)._cardId;

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
      check.bind(this);
      setTimeout(check, 50);
    });
  }
}
