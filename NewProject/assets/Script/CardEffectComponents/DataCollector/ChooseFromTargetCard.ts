import Character from "../../Entites/CardTypes/Character";
import Card from "../../Entites/GameEntities/Card";
import Deck from "../../Entites/GameEntities/Deck";
import Player from "../../Entites/GameEntities/Player";
import ActionManager from "../../Managers/ActionManager";
import CardManager from "../../Managers/CardManager";
import { EffectTarget } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";
import { GAME_EVENTS } from "../../Constants";



const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseFromTargetCard extends DataCollector {
  collectorName = "ChooseFromTargetCard";
  isEffectChosen: boolean = false;
  cardChosen: cc.Node;
  playerId: number;

  // isCardChosen: boolean = false;

  set isCardChosen(boolean: boolean) {
    whevent.emit(GAME_EVENTS.CHOOSE_FROM_TARGET_CARD_CARD_CHOSEN, boolean)
  }

  @property
  isItems: boolean = false;

  @property
  isLootCards: boolean = false;

  @property
  isRandom: boolean = false;


  @property(DataCollector)
  dataCollectorToRun: DataCollector = null



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
    let target: EffectTarget
    if (this.dataCollectorToRun.cardChosen) {
      target = new EffectTarget(this.dataCollectorToRun.cardChosen)
    } else {
      target = await this.dataCollectorToRun.collectData(data)
    }
    let targetPlayer = PlayerManager.getPlayerByCard(target.effectTargetCard)
    if (this.isItems) cardsToChooseFrom.concat(targetPlayer.deskCards.filter(card => {
      if (card.getComponent(Character)) return false;
    }))
    if (this.isLootCards) cardsToChooseFrom.concat(targetPlayer.handCards)

    if (cardsToChooseFrom.length == 0) {
      throw 'No Cards To Choose From!'
    }
    if (!this.isRandom) {
      let cardChosenData: {
        cardChosenId: number;
        playerId: number;
      } = await this.requireChoosingACard(cardsToChooseFrom);
      target = new EffectTarget(CardManager.getCardById(cardChosenData.cardChosenId, true))
      cc.log(`chosen ${target.effectTargetCard.name}`)
    } else {
      let randIndex = Math.random() * cardsToChooseFrom.length
      target = new EffectTarget(cardsToChooseFrom[randIndex])
    }
    return target;
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
      whevent.onOnce(GAME_EVENTS.CHOOSE_FROM_TARGET_CARD_CARD_CHOSEN, (data) => {
        if (data) {
          resolve(this.cardChosen);
        }
      })
    })
  }
}
