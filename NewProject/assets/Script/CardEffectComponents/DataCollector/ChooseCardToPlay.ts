import Card from "../../Entites/GameEntities/Card";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { EffectTarget } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import Effect from "../CardEffects/Effect";
import { CHOOSE_CARD_TYPE, GAME_EVENTS, CARD_TYPE } from "./../../Constants";
import DataCollector from "./DataCollector";
import DecisionMarker from "../../Entites/Decision Marker";
import { whevent } from "../../../ServerClient/whevent";
import AnnouncementLable from "../../LableScripts/Announcement Lable";
import PileManager from "../../Managers/PileManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SelectLootToPlay extends DataCollector {
  collectorName = "SelectLootToPlay";
  cardChosen: cc.Node;
  playerId: number;

  // isCardChosen: boolean = false;
  setIsCardChosen(boolean: boolean) {
    this.isCardChosen = boolean;
    whevent.emit(GAME_EVENTS.SELECT_LOOT_TO_PLAY_CARD_CHOSEN, boolean)
  }

  /**
   *
   * @param data cardPlayerId:Player who played the card
   * @returns {target:cc.node of the player who played the card}
   */

  // tslint:disable-next-line: ban-types
  async collectData(data): Promise<EffectTarget> {
    const player = PlayerManager.getPlayerById(data.cardPlayerId)
    this.playerId = data.cardPlayerId;
    //what cards to choose from
    const chooseType = this.node.parent.getComponent(Effect).chooseType;
    const cardsToChooseFrom = this.getCardsToChoose(chooseType, player);
    const cardPlayedData = await this.requireChoosingACard(cardsToChooseFrom);
    const cardPlayed = CardManager.getCardById(cardPlayedData.cardPlayedId, true);
    await DecisionMarker.$.showDecision(player.character, cardPlayed, true, true)
    const target = new EffectTarget(cardPlayed)
    cardPlayed.getComponent(Card).isGoingToBePlayed = true
    cc.log(`chosen ${target.effectTargetCard.name}`)
    return target;
  }

  getCardsToChoose(chooseType: CHOOSE_CARD_TYPE, player: Player) {
    switch (chooseType) {
      case CHOOSE_CARD_TYPE.ALL_PLAYERS:
        const playerCards: cc.Node[] = [];
        for (let index = 0; index < PlayerManager.players.length; index++) {
          const player = PlayerManager.players[index].getComponent(Player);
          playerCards.push(player.character);
        }
        return playerCards.filter(card => !card.getComponent(Card).isGoingToBePlayed);
      case CHOOSE_CARD_TYPE.MY_HAND:
        return player.hand.layoutCards.filter(card => !card.getComponent(Card).isGoingToBePlayed);
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
    AnnouncementLable.$.showAnnouncement(`Player ${this.playerId} Is Choosing Loot To Play`, 0, true)
    const cardPlayed = await this.waitForCardPlay();
    AnnouncementLable.$.hideAnnouncement(true)

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      await CardManager.unRequiredForDataCollector(card);
    }
    await PileManager.addCardToPile(CARD_TYPE.LOOT_PLAY, cardPlayed, true)
    const cardId = cardPlayed.getComponent(Card)._cardId;

    return new Promise((resolve, reject) => {
      resolve({ cardPlayedId: cardId, playerId: this.playerId });
    });
  }

  async waitForCardPlay(): Promise<cc.Node> {
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.SELECT_LOOT_TO_PLAY_CARD_CHOSEN, (data) => {
        if (data) {
          resolve(this.cardChosen);
        }
      })
    })
  }
}
