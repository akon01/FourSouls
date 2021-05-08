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
  currTargets: Deck[] = [];

  /**
   *
   * @param data {target:PlayerId}
   */
  //@printMethodStarted(COLORS.RED)
  doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData
  ) {

    this.currData = data
    this.currStack = stack
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
        this.currTargets = decks
        return this.handleTarget(0, this.currTargets.length)
      } else {
        switch (this.deckType) {
          case CARD_TYPE.LOOT:
            return WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck)!.discardTopCard().then(_ => {
              return this.handleReturnValues()
            })
          case CARD_TYPE.MONSTER:
            return WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!.discardTopCard().then(_ => {
              return this.handleReturnValues()
            })
          case CARD_TYPE.TREASURE:
            return WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!.discardTopCard().then(_ => {
              return this.handleReturnValues()
            })
          default:
            return this.handleReturnValues()
        }
      }
    } else {
      const decks = (data.getTargets(TARGETTYPE.DECK) as Node[]).map(target => target.getComponent(Deck)!)
      if (decks.length == 0) {
        throw new CardEffectTargetError(`target decks are null`, true, data, stack)
      }
      this.currTargets = decks
      return this.handleTarget(0, this.currTargets.length)
    }
  }

  handleTarget(index: number, length: number) {
    const deck = this.currTargets[index]
    return deck.discardTopCard().then(_ => {
      return this.handleAfterTarget(index++, length, this.handleTarget, this)
    })
  }
}
