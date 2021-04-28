import { Node, _decorator } from 'cc';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Deck } from "../../Entites/GameEntities/Deck";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { EffectTarget } from '../../Managers/EffectTarget';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CardFilter } from "../ChooseCardFilters/CardFilter";
import { FilterConcrete } from "../ChooseCardFilters/FilterConcrete";
import { ChooseCardTypeAndFilter } from "../ChooseCardTypeAndFilter";
import { ChooseCard } from "../DataCollector/ChooseCard";
import { CARD_TYPE, CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;



@ccclass('LootThenPutOnTop')
export class LootThenPutOnTop extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;
  effectName = "LootThenPutOnTop";
  @property
  numToGet = 1;
  @property
  numToPut = 1;
  @property
  isDiscardInstesdOfTop = false;
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }
    const playerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (!playerCard) {
      throw new CardEffectTargetError(`No Player Card Target Found`, true, data, stack)
    }
    if (playerCard instanceof Node) {
      const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)
      if (player == null) {
        throw new Error(`no player to loot`)
      } else {
        for (let i = 0; i < this.numToGet; i++) {
          await player.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true);
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
          cardChoose.numOfCardsToChoose = this.numToPut
        }
        cardChoose.flavorText = "Choose Loot To Put On Top"
        const chosenData: EffectTarget | EffectTarget[] = await cardChoose.collectData({ cardPlayerId: player.playerId })
        // let chosenCard = WrapperProvider.cardManagerWrapper.out.getCardById(chosenData.cardChosenId, true)
        const cards: Node[] = []
        if (Array.isArray(chosenData)) {
          cards.push(...chosenData.map(c => c.effectTargetCard))
        } else {
          cards.push(chosenData.effectTargetCard)
        }
        const lootDeck = WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck);
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
    return WrapperProvider.stackWrapper.out._currentStack
  }
  async putOnDeck(card: Node, player: Player) {
    const lootDeck = WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck)!;
    await WrapperProvider.cardManagerWrapper.out.moveCardTo(card, lootDeck.node, true, false);
    await player.loseLoot(card, true)
    await lootDeck.addToDeckOnTop(card, 0, true)
  }
  async discardACard(card: Node, player: Player) {
    await player.loseLoot(card, true)
    await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.LOOT, card, true)
  }
}
