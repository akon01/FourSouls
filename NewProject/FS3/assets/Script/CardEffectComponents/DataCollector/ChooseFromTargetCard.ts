import { Node, _decorator } from 'cc';
import { whevent } from '../../../ServerClient/whevent';
import { GAME_EVENTS } from "../../Constants";
import { Character } from "../../Entites/CardTypes/Character";
import { Card } from "../../Entites/GameEntities/Card";
import { Deck } from "../../Entites/GameEntities/Deck";
import { EffectTarget } from '../../Managers/EffectTarget';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from './DataCollector';
const { ccclass, property } = _decorator;

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
  isItems = false;

  @property
  isLootCards = false;

  @property
  isRandom = false;

  @property({
    visible: function (this: ChooseFromTargetCard) {
      return !this.isRandom
    }
  })
  flavorText = ''

  @property({ tooltip: "set to 0 for as many as you would like to choose"  })
  numberOfCardsToChoose = 1;

  @property
  chooseFromCardPreviewManager=false




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
      const mePlayer = WrapperProvider.playerManagerWrapper.out.mePlayer!
      const numOfCardsToChoose = this.getQuantityInRegardsToBlankCard(mePlayer,this.numberOfCardsToChoose)
      if(this.chooseFromCardPreviewManager){
        const cardsChosenNodes = await WrapperProvider.cardPreviewManagerWrapper.out.selectFromCards(cardsToChooseFrom, numOfCardsToChoose) 
        const cardsChosenTargets = cardsChosenNodes.map(card => WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(card))
        return cardsChosenTargets
      } else {
        const chosen:EffectTarget[] = []
        for (let index = 0; index < numOfCardsToChoose; index++) {
          cardsToChooseFrom = cardsToChooseFrom.filter(c=>!chosen.map(cho=>cho.effectTargetCard).includes(c))      
          chosen.push(await this.getTargetByChoosing(cardsToChooseFrom))
        }
        return chosen 
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
 async getTargetByChoosing(cardsToChooseFrom: Node[]) {
    const cardChosenId = await this.requireChoosingACard(cardsToChooseFrom);
    return WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(WrapperProvider.cardManagerWrapper.out.getCardById(cardChosenId, true))
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
