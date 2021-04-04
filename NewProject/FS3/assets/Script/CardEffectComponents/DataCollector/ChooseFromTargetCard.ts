import { _decorator, Node, CCInteger, log } from 'cc';
import { whevent } from '../../../ServerClient/whevent';
const { ccclass, property } = _decorator;

import { GAME_EVENTS } from "../../Constants";
import { CardEffect } from '../../Entites/CardEffect';
import { Character } from "../../Entites/CardTypes/Character";
import { Card } from "../../Entites/GameEntities/Card";
import { Deck } from "../../Entites/GameEntities/Deck";
import { EffectTarget } from '../../Managers/EffectTarget';
import { EffectTargetFactory } from '../../Managers/EffectTargetFactory';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from './DataCollector';
@ccclass('ChooseFromTargetCard')
export class ChooseFromTargetCard extends DataCollector {
  cardChosen: Node | null = null;
  playerId: number | null = null;

  // isCardChosen: boolean = false;

  setIsCardChosen(boolean: boolean) {
    this.isCardChosen = boolean
    whevent.emit(GAME_EVENTS.CHOOSE_FROM_TARGET_CARD_CARD_CHOSEN, boolean)
  }

  @property
  isItems: boolean = false;

  @property
  isLootCards: boolean = false;

  @property
  isRandom: boolean = false;

  @property({
    visible: function (this: ChooseFromTargetCard) {
      return !this.isRandom
    }
  })
  flavorText: string = ''

  @property
  isMultiCardChoice: boolean = false;

  @property({
    visible: function (this: ChooseFromTargetCard) {
      return this.isMultiCardChoice
    }
    , tooltip: "set to 0 for as many as you would like to choose"
  })
  numberOfCardsToChoose: number = -1;



  // @property(CCInteger)
  // dataCollectorToRunIdFinal: number = -1

  @property(DataCollector)
  dataCollectorToRun: DataCollector | null = null


  getDataCollectorToRun() {
    return this.dataCollectorToRun
    // return this.node.getComponent(CardEffect)!.getDataCollector(this.dataCollectorToRunIdFinal)
  }

  /**
   *  @throws when there are no cards to choose from in the choose type
   * @param data cardPlayerId:Player who played the card
   * @returns {target:node of the player who played the card}
   */

  async collectData(data: {
    cardPlayerId: number;
  }): Promise<EffectTarget | EffectTarget[]> {
    let cardsToChooseFrom: Node[] = []
    let target: EffectTarget
    const dataCollectorToRun = this.getDataCollectorToRun();
    if (!dataCollectorToRun) { debugger; throw new Error("No Data Collector To Run Set!"); }

    if (dataCollectorToRun.cardChosen) {
      target = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(dataCollectorToRun.cardChosen)
    } else {
      console.log(`in Choose From Target Card collect data of ${dataCollectorToRun.collectorName}`)

      target = await dataCollectorToRun.collectData(data)
    }
    if (!target) {
      throw new Error(`No target from dataCollectorToRun ${dataCollectorToRun.collectorName}`)
    }
    if (Array.isArray(target)) {
      target = target[0]
    }
    const targetPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target.effectTargetCard)!

    if (this.isItems) {
      cardsToChooseFrom = cardsToChooseFrom.concat(targetPlayer.getDeskCards().filter(card => {
        if (card.getComponent(Character)) { return false; }
      }))
    }
    if (this.isLootCards) { cardsToChooseFrom = cardsToChooseFrom.concat(targetPlayer.getHandCards()) }
    if (cardsToChooseFrom.length == 0) {
      console.log(targetPlayer)
      throw new Error("No Cards To Choose From!")
    }
    if (!this.isRandom) {
      WrapperProvider.cardPreviewManagerWrapper.out.setFalvorText(this.flavorText)
      if (this.isMultiCardChoice) {
        const cardsChosenNodes = await WrapperProvider.cardPreviewManagerWrapper.out.selectFromCards(cardsToChooseFrom, this.numberOfCardsToChoose)
        const cardsChosenTargets = cardsChosenNodes.map(card => WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(card))
        return cardsChosenTargets
      } else {
        const cardChosenId = await this.requireChoosingACard(cardsToChooseFrom);
        target = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(WrapperProvider.cardManagerWrapper.out.getCardById(cardChosenId, true))
        console.log(`chosen ${target.effectTargetCard.name}`)
      }
    } else {
      const randIndex = Math.floor(Math.random() * cardsToChooseFrom.length)
      if (randIndex != 0) {
        target = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(cardsToChooseFrom[randIndex - 1])
      } else {
        target = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(cardsToChooseFrom[0])
      }

    }
    return target;
  }

  async requireChoosingACard(
    cards: Node[]
  ): Promise<number> {
    WrapperProvider.actionManagerWrapper.out.inReactionPhase = true;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      WrapperProvider.cardManagerWrapper.out.disableCardActions(card);
      WrapperProvider.cardManagerWrapper.out.makeRequiredForDataCollector(this, card);
    }
    const cardPlayed = await this.waitForCardToBeChosen();
    //   let cardServerEffect = await WrapperProvider.cardManagerWrapper.out.getCardEffect(cardPlayed,this.playerId)
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      await WrapperProvider.cardManagerWrapper.out.unRequiredForDataCollector(card);
      //  WrapperProvider.cardManagerWrapper.out.disableCardActions(card);
    }
    let cardId;
    if (cardPlayed.getComponent(Deck) == null) {
      cardId = cardPlayed.getComponent(Card)!._cardId;
    } else {
      cardId = cardPlayed.getComponent(Deck)!._cardId;
    }
    WrapperProvider.actionManagerWrapper.out.inReactionPhase = false;
    return cardId
  }

  async waitForCardToBeChosen(): Promise<Node> {
    return new Promise((resolve) => {
      whevent.onOnce(GAME_EVENTS.CHOOSE_FROM_TARGET_CARD_CARD_CHOSEN, (data: any) => {
        if (data) {
          resolve(this.cardChosen!);
        }
      })
    })
  }
}
