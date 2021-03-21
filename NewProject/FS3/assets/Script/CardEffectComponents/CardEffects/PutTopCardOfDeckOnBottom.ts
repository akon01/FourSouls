import { _decorator, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

import { CARD_TYPE, TARGETTYPE, CHOOSE_CARD_TYPE } from "../../Constants";
import { Deck } from "../../Entites/GameEntities/Deck";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";

import { Effect } from "./Effect";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('PutTopCardOfDeckOnBottom')
export class PutTopCardOfDeckOnBottom extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;
  effectName = "PutTopCardOfDeckOnBottom";
  @property({ type: Enum(CARD_TYPE) })
  deckType: CARD_TYPE = CARD_TYPE.CHAR;
  /**
   *
   * @param data {target:PlayerId}
   */
  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {
    let deck: Deck | null = null;
    if (data == null) {

      switch (this.deckType) {
        case CARD_TYPE.LOOT:
          deck = WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck)
          break;
        case CARD_TYPE.MONSTER:
          deck = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)
          break;
        case CARD_TYPE.TREASURE:
          deck = WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)
        default:
          break;
      }
    } else {

      deck = (data.getTarget(TARGETTYPE.DECK) as Node).getComponent(Deck)
    }
    if (!deck) { debugger; throw new Error("No Deck Found"); }

    if (deck.getCardsLength() > 1) {
      const card = deck.getCards()[deck.getCardsLength() - 1]// []
      deck.drawSpecificCard(card, true)
      deck.addToDeckOnBottom(card, 0, true)
    }
    if (this.conditions.length > 0) {
      return data!;
    } else { return stack }
  }
}
