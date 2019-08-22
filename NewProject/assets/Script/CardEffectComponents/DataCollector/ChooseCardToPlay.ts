import Card from "../../Entites/GameEntities/Card";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { EffectTarget } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import Effect from "../CardEffects/Effect";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import DataCollector from "./DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SelectLootToPlay extends DataCollector {
  collectorName = "SelectLootToPlay";
  isEffectChosen: boolean = false;
  cardChosen: cc.Node;
  playerId: number;

  isCardChosen: boolean = false;

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
    cc.log(cardPlayedData)
    let cardPlayed = CardManager.getCardById(cardPlayedData.cardPlayedId, true);
    cc.log(cardPlayed.name)


    let target = new EffectTarget(cardPlayed)
    cc.log(target)
    cc.log(`chosen ${target.effectTargetCard.name}`)
    return target;
  }

  getCardsToChoose(chooseType: CHOOSE_CARD_TYPE, player: Player) {
    switch (chooseType) {
      case CHOOSE_CARD_TYPE.ALL_PLAYERS:
        let playerCards: cc.Node[] = [];
        for (let index = 0; index < PlayerManager.players.length; index++) {
          const player = PlayerManager.players[index].getComponent(Player);
          playerCards.push(player.character);
        }
        return playerCards;
        break;
      case CHOOSE_CARD_TYPE.MY_HAND:
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
