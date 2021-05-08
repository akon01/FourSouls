import { Node, _decorator } from 'cc';
import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Card } from "../../Entites/GameEntities/Card";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('DiscardSoulCard')
export class DiscardSoulCard extends Effect {
  effectName = "DiscardSoulCard";
  currTargets: StackEffectInterface[] | Node[] | number[] | Effect[] = [];

  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    if (!data) { debugger; throw new Error("No Data!"); }
    const targetCards = data.getTargets(TARGETTYPE.CARD)
    if (targetCards.length == 0) {
      throw new CardEffectTargetError(`target soul cards to dicard are null`, true, data, stack)
    } else {
      this.currTargets = targetCards
      this.currData = data
      this.currStack = stack
      return this.handleTarget(0, this.currTargets.length)
    }
  }

  handleTarget(index: number, length: number) {
    const cardToDiscard = this.currTargets[index] as Node;
    const playerOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardToDiscard)!
    const cardComp = cardToDiscard.getComponent(Card)!
    playerOwner.loseSoul(cardToDiscard, true)
    switch (cardComp.type) {
      case CARD_TYPE.MONSTER:
        return WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.MONSTER, cardToDiscard, true).then(_ => {
          return this.handleAfterTarget(index++, length, this.handleTarget, this)
        })
        break;
      case CARD_TYPE.TREASURE:
        return WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.TREASURE, cardToDiscard, true).then(_ => {
          return this.handleAfterTarget(index++, length, this.handleTarget, this)
        })
        break;
      case CARD_TYPE.LOOT:
        return WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.LOOT, cardToDiscard, true).then(_ => {
          return this.handleAfterTarget(index++, length, this.handleTarget, this)
        })
        break;
      case CARD_TYPE.BONUS_SOULS:
        cardToDiscard.destroy()
        return this.handleAfterTarget(index++, length, this.handleTarget, this)
        // await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.MONSTER, cardToDiscard, true)
        break;
      default:
        return this.handleAfterTarget(index++, length, this.handleTarget, this)
        break;
    }
  }
}
