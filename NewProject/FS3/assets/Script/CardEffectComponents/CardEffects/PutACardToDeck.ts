import { _decorator, log, Node } from 'cc';
const { ccclass, property } = _decorator;

import { CARD_TYPE, TARGETTYPE, CHOOSE_CARD_TYPE } from "../../Constants";
import { Card } from "../../Entites/GameEntities/Card";
import { Deck } from "../../Entites/GameEntities/Deck";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from '../../StackEffects/StackEffectInterface';
import { Effect } from './Effect';

@ccclass('PutACardToDeck')
export class PutACardToDeck extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;
  effectName = "PutACardToDeck";
  @property
  numOfCardsOffset: number = 0;
  @property
  putOnBottomOfDeck: boolean = false;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData,
  ) {
    console.log(data);
    if (!data) { debugger; throw new Error("No Data"); }
    const cardTargets = data.getTargets(TARGETTYPE.CARD);
    if (cardTargets == null || cardTargets.length == 0) {
      throw new Error(`no target in ${this.name}`);
    } else {
      if (cardTargets.length > 1) {

        for (let i = 0; i < cardTargets.length; i++) {
          const target = cardTargets[i] as Node;
          const test = await this.putInDeck(target);
          console.log(test);
          console.log(`finished putting ${(target).name} in deck`);
        }
      } else {
        await this.putInDeck(cardTargets[0] as Node);
      }
    }
    if (this.conditions.length > 0) {
      return data;
    } else { return stack; }
  }
  async putInDeck(card: Node) {
    console.log(`put in deck of ${card.name}`);
    const cardComp = card.getComponent(Card)!;
    const deck = WrapperProvider.cardManagerWrapper.out.getDeckByType(cardComp.type).getComponent(Deck)!;

    if (deck.hasCard(card)) {
      deck.removeCard(card);
    }

    const pile = WrapperProvider.pileManagerWrapper.out.getPileByCard(card)
    if (pile) {
      WrapperProvider.pileManagerWrapper.out.removeFromPile(card, true)
    }

    if (this.putOnBottomOfDeck) {
      await deck.addToDeckOnBottom(card, this.numOfCardsOffset, true);
    } else {
      await deck.addToDeckOnTop(card, this.numOfCardsOffset, true);
    }

    switch (deck.deckType) {
      case CARD_TYPE.TREASURE:
        if (WrapperProvider.storeWrapper.out.getStoreCards().indexOf(card) >= 0) {
          await WrapperProvider.storeWrapper.out.removeFromStore(card, true);
        }
        break;
      case CARD_TYPE.MONSTER:
        if (WrapperProvider.monsterFieldWrapper.out.getActiveMonsters().indexOf(card) >= 0) {
          console.log(`b4 put `);
          const cardId = cardComp._cardId;
          const monsterCardHolder = WrapperProvider.monsterFieldWrapper.out.getMonsterPlaceByActiveMonsterId(cardId)!;
          console.log(`b4 remove monster of monster holder`);
          await monsterCardHolder.removeMonster(card, true);
          console.log(`after remove monster of monster holder`);
        }
      default:
        break;
    }
    return true;
  }
}