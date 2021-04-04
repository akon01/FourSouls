import { _decorator, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { Card } from "../../Entites/GameEntities/Card";
import { Player } from "../../Entites/GameEntities/Player";
import { CardManager } from "../../Managers/CardManager";
import { EffectTarget } from "../../Managers/EffectTarget";
import { PlayerManager } from "../../Managers/PlayerManager";
import { Effect } from "../CardEffects/Effect";
import { CHOOSE_CARD_TYPE, GAME_EVENTS, CARD_TYPE } from "./../../Constants";
import { DataCollector } from "./DataCollector";
import { DecisionMarker } from "../../Entites/DecisionMarker";
import { whevent } from "../../../ServerClient/whevent";
import { AnnouncementLable } from "../../LableScripts/AnnouncementLable";
import { PileManager } from "../../Managers/PileManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { EffectTargetFactory } from '../../Managers/EffectTargetFactory';

@ccclass('SelectLootToPlay')
export class SelectLootToPlay extends DataCollector {
  collectorName = "SelectLootToPlay";
  cardChosen: Node | null = null;
  playerId: number | null = null;

  // isCardChosen: boolean = false;
  setIsCardChosen(boolean: boolean) {
    this.isCardChosen = boolean;
    whevent.emit(GAME_EVENTS.SELECT_LOOT_TO_PLAY_CARD_CHOSEN, boolean)
  }

  /**
   *
   * @param data cardPlayerId:Player who played the card
   * @returns {target:node of the player who played the card}
   */

  // tslint:disable-next-line: ban-types
  async collectData(data: any): Promise<EffectTarget> {
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!
    this.playerId = data.cardPlayerId;
    //what cards to choose from
    const chooseType = CHOOSE_CARD_TYPE.MY_HAND;
    const cardsToChooseFrom = this.getCardsToChoose(chooseType, player);
    const cardPlayedData = await this.requireChoosingACard(cardsToChooseFrom);
    const cardPlayed = WrapperProvider.cardManagerWrapper.out.getCardById(cardPlayedData.cardPlayedId, true);
    await WrapperProvider.decisionMarkerWrapper.out.showDecision(player.character!, cardPlayed, true, true)
    const target = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(cardPlayed)
    cardPlayed.getComponent(Card)!.isGoingToBePlayed = true
    console.log(`chosen ${target.effectTargetCard.name}`)
    return target;
  }

  getCardsToChoose(chooseType: CHOOSE_CARD_TYPE, player: Player) {
    switch (chooseType) {
      case CHOOSE_CARD_TYPE.ALL_PLAYERS:
        const playerCards: Node[] = [];
        for (let index = 0; index < WrapperProvider.playerManagerWrapper.out.players.length; index++) {
          const player = WrapperProvider.playerManagerWrapper.out.players[index].getComponent(Player)!;
          playerCards.push(player.character!);
        }
        return playerCards.filter(card => !card.getComponent(Card)!.isGoingToBePlayed);
      case CHOOSE_CARD_TYPE.MY_HAND:
        return player.hand!.layoutCards.filter(card => !card.getComponent(Card)!.isGoingToBePlayed);
      default:
        throw new Error("No Choose Card Type Handler!");

        break;
    }
  }

  async requireChoosingACard(
    cards: Node[]
  ): Promise<{ cardPlayedId: number; playerId: number }> {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      WrapperProvider.cardManagerWrapper.out.disableCardActions(card);
      WrapperProvider.cardManagerWrapper.out.makeRequiredForDataCollector(this, card);
    }
    WrapperProvider.announcementLableWrapper.out.showAnnouncement(`Player ${this.playerId} Is Choosing Loot To Play`, 0, true)
    const cardPlayed = await this.waitForCardPlay();
    WrapperProvider.announcementLableWrapper.out.hideAnnouncement(true)

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      await WrapperProvider.cardManagerWrapper.out.unRequiredForDataCollector(card);
    }
    await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.LOOT_PLAY, cardPlayed, true)
    const cardId = cardPlayed.getComponent(Card)!._cardId;

    return new Promise((resolve, reject) => {
      resolve({ cardPlayedId: cardId, playerId: this.playerId! });
    });
  }

  async waitForCardPlay(): Promise<Node> {
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.SELECT_LOOT_TO_PLAY_CARD_CHOSEN, (data: any) => {
        if (data) {
          resolve(this.cardChosen!);
        }
      })
    })
  }
}
