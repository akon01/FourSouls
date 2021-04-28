import { Enum, Node, _decorator } from 'cc';
import { CARD_TYPE, CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Deck } from "../../Entites/GameEntities/Deck";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;



@ccclass('DiscardTopCardOfDeck')
export class DiscardTopCardOfDeck extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;
  effectName = "DiscardTopCardOfDeck";
  @property
  multiType = false
  @property({
    type: [Enum(CARD_TYPE)], visible: function (this: DiscardTopCardOfDeck) {
      return this.multiType
    }
  })
  deckTypes: CARD_TYPE[] = []
  @property({
    type: Enum(CARD_TYPE), visible: function (this: DiscardTopCardOfDeck) {
      return !this.multiType
    }
  })
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

    if (data == null) {
      if (this.multiType) {
        const decks = new Array<Deck>()
        for (const type of this.deckTypes) {
          switch (type) {
            case CARD_TYPE.LOOT:
              decks.push(WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck)!)
              break;
            case CARD_TYPE.MONSTER:
              decks.push(WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!)
              break;
            case CARD_TYPE.TREASURE:
              decks.push(WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!)
              break
            default:
              break;
          }
        }
        for (const deck of decks) {
          await deck.discardTopCard()
        }

      } else {
        switch (this.deckType) {
          case CARD_TYPE.LOOT:
            await WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck)!.discardTopCard()
            break;
          case CARD_TYPE.MONSTER:
            await WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!.discardTopCard()
            break;
          case CARD_TYPE.TREASURE:
            await WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!.discardTopCard()
            break
          default:
            break;
        }
      }

    } else {

      const decks = (data.getTargets(TARGETTYPE.DECK) as Node[]).map(target => target.getComponent(Deck)!)
      if (decks.length == 0) {
        throw new CardEffectTargetError(`target decks are null`, true, data, stack)
      }
      for (const deck of decks) {
        await deck.discardTopCard()
      }

    }
    if (this.conditions.length > 0) {
      return data!;
    } else {
      return stack
    }
  }
}
