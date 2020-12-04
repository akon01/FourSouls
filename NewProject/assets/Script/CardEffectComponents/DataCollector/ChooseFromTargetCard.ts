import { GAME_EVENTS } from "../../Constants";
import Character from "../../Entites/CardTypes/Character";
import Card from "../../Entites/GameEntities/Card";
import Deck from "../../Entites/GameEntities/Deck";
import Player from "../../Entites/GameEntities/Player";
import ActionManager from "../../Managers/ActionManager";
import CardManager from "../../Managers/CardManager";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { EffectTarget } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";
import { whevent } from "../../../ServerClient/whevent";
import IdAndName from "../IdAndNameComponent";
import { createNewDataCollector } from "../../reset";
import CardEffect from "../../Entites/CardEffect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseFromTargetCard extends DataCollector {
  collectorName = "ChooseFromTargetCard";
  cardChosen: cc.Node;
  playerId: number;

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
      if (!this.isRandom) {
        return true
      }
    }
  })
  flavorText: string = ''

  @property
  isMultiCardChoice: boolean = false;

  @property({
    visible: function (this: ChooseFromTargetCard) {
      if (this.isMultiCardChoice) { return true }
    }
    , tooltip: "set to 0 for as many as you would like to choose"
  })
  numberOfCardsToChoose: number = -1;

  @property(DataCollector)
  dataCollectorToRun: DataCollector = null

  @property(IdAndName)
  dataCollectorToRunId: IdAndName = new IdAndName()

  @property(cc.Integer)
  dataCollectorToRunIdFinal: number = -1

  setWithOld(data: ChooseFromTargetCard) {
    if (data.dataCollectorToRun) {
      const newId = createNewDataCollector(this.node, data.dataCollectorToRun)
      this.dataCollectorToRunId.id = newId
      this.dataCollectorToRunId.name = data.dataCollectorToRun.collectorName
      data.dataCollectorToRun = null
      this.dataCollectorToRun = null
    }
  }

  getDataCollectorToRun() {
    return this.node.getComponent(CardEffect).getDataCollector(this.dataCollectorToRunId.id)
  }

  /**
   *  @throws when there are no cards to choose from in the choose type
   * @param data cardPlayerId:Player who played the card
   * @returns {target:cc.node of the player who played the card}
   */

  async collectData(data: {
    cardPlayerId;
  }): Promise<EffectTarget | EffectTarget[]> {
    let cardsToChooseFrom: cc.Node[] = []
    let target: EffectTarget
    const dataCollectorToRun = this.getDataCollectorToRun();
    if (dataCollectorToRun.cardChosen) {
      target = new EffectTarget(dataCollectorToRun.cardChosen)
    } else {
      cc.log(`in Choose From Target Card collect data of ${dataCollectorToRun.collectorName}`)

      target = await dataCollectorToRun.collectData(data)
    }
    if (!target) {
      throw new Error(`No target from dataCollectorToRun ${dataCollectorToRun.collectorName}`)
    }
    if (Array.isArray(target)) {
      target = target[0]
    }
    const targetPlayer = PlayerManager.getPlayerByCard(target.effectTargetCard)

    if (this.isItems) {
      cardsToChooseFrom = cardsToChooseFrom.concat(targetPlayer.getDeskCards().filter(card => {
        if (card.getComponent(Character)) { return false; }
      }))
    }
    if (this.isLootCards) { cardsToChooseFrom = cardsToChooseFrom.concat(targetPlayer.getHandCards()) }
    if (cardsToChooseFrom.length == 0) {
      cc.log(targetPlayer)
      throw new Error("No Cards To Choose From!")
    }
    if (!this.isRandom) {
      CardPreviewManager.setFalvorText(this.flavorText)
      if (this.isMultiCardChoice) {
        const cardsChosenNodes = await CardPreviewManager.selectFromCards(cardsToChooseFrom, this.numberOfCardsToChoose)
        const cardsChosenTargets = cardsChosenNodes.map(card => new EffectTarget(card))
        return cardsChosenTargets
      } else {
        const cardChosenId = await this.requireChoosingACard(cardsToChooseFrom);
        target = new EffectTarget(CardManager.getCardById(cardChosenId, true))
        cc.log(`chosen ${target.effectTargetCard.name}`)
      }
    } else {
      const randIndex = Math.floor(Math.random() * cardsToChooseFrom.length)
      if (randIndex != 0) {
        target = new EffectTarget(cardsToChooseFrom[randIndex - 1])
      } else {
        target = new EffectTarget(cardsToChooseFrom[0])
      }

    }
    return target;
  }

  async requireChoosingACard(
    cards: cc.Node[]
  ): Promise<number> {
    ActionManager.inReactionPhase = true;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      CardManager.disableCardActions(card);
      CardManager.makeRequiredForDataCollector(this, card);
    }
    const cardPlayed = await this.waitForCardToBeChosen();
    //   let cardServerEffect = await CardManager.getCardEffect(cardPlayed,this.playerId)
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      await CardManager.unRequiredForDataCollector(card);
      //  CardManager.disableCardActions(card);
    }
    let cardId;
    if (cardPlayed.getComponent(Deck) == null) {
      cardId = cardPlayed.getComponent(Card)._cardId;
    } else {
      cardId = cardPlayed.getComponent(Deck)._cardId;
    }
    ActionManager.inReactionPhase = false;
    return cardId
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
