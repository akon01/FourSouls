import Deck from "../../Entites/GameEntities/Deck";
import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, EffectTarget, PassiveEffectData } from "../../Managers/DataInterpreter";
import PileManager from "../../Managers/PileManager";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import CardFilter from "../Choose Card Filters/CardFilter";
import FilterConcrete from "../Choose Card Filters/FilterConcrete";
import ChooseCardTypeAndFilter from "../ChooseCardTypeAndFilter";
import ChooseCard from "../DataCollector/ChooseCard";
import { CARD_TYPE, CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LootThenPutOnTop extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;

  effectName = "LootThenPutOnTop";

  @property
  numToGet: number = 1;

  @property
  numToPut: number = 1;

  @property
  isDiscardInstesdOfTop: boolean = false;

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    const playerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (playerCard instanceof cc.Node) {
      const player = PlayerManager.getPlayerByCard(playerCard)
      if (player == null) {
        throw new Error(`no player to loot`)
      } else {
        for (let i = 0; i < this.numToGet; i++) {
          await player.drawCard(CardManager.lootDeck, true);
        }
        const cardChoose = new ChooseCard();
        cardChoose.chooseType = new ChooseCardTypeAndFilter()
        cardChoose.chooseType.chooseType = CHOOSE_CARD_TYPE.MY_HAND;
        cardChoose.chooseType.applyFilter = true
        cardChoose.chooseType.filterStatement = new FilterConcrete()
        cardChoose.chooseType.filterStatement.filterType = 1
        cardChoose.chooseType.filterStatement.componentType = 2
        cardChoose.chooseType.componentName = "Card"
        cardChoose.chooseType.filterStatement.cardFilter = new CardFilter()
        cardChoose.chooseType.filterStatement.cardFilter.filter = 0;
        if (this.numToPut > 1) {
          cardChoose.isMultiCardChoice = true
          cardChoose.numOfCardsToChoose = this.numToPut
        }
        cardChoose.flavorText = "Choose Loot To Put On Top"
        const chosenData: EffectTarget | EffectTarget[] = await cardChoose.collectData({ cardPlayerId: player.playerId })
        // let chosenCard = CardManager.getCardById(chosenData.cardChosenId, true)
        const cards: cc.Node[] = []
        if (Array.isArray(chosenData)) {
          cards.push(...chosenData.map(c => c.effectTargetCard))
        } else {
          cards.push(chosenData.effectTargetCard)
        }
        const lootDeck = CardManager.lootDeck.getComponent(Deck);
        for (let i = 0; i < this.numToPut; i++) {
          const card = cards[i]
          if (!this.isDiscardInstesdOfTop) {
            await this.putOnDeck(card, player)
          } else {
            await this.discardACard(card, player)
          }
        }
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }

  async putOnDeck(card: cc.Node, player: Player) {
    const lootDeck = CardManager.lootDeck.getComponent(Deck);
    await CardManager.moveCardTo(card, lootDeck.node, true, false);
    await player.loseLoot(card, true)
    await lootDeck.addToDeckOnTop(card,0, true)
  }

  async discardACard(card: cc.Node, player: Player) {
    await player.loseLoot(card, true)
    await PileManager.addCardToPile(CARD_TYPE.LOOT, card, true)
  }

}