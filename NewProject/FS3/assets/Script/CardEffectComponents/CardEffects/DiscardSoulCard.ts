import { _decorator, CCInteger, Node } from 'cc';
const { ccclass, property } = _decorator;

import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import { Card } from "../../Entites/GameEntities/Card";
import { Stack } from "../../Entites/Stack";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PileManager } from "../../Managers/PileManager";
import { PlayerManager } from "../../Managers/PlayerManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";

@ccclass('DiscardSoulCard')
export class DiscardSoulCard extends Effect {
  effectName = "DiscardSoulCard";
  @property(CCInteger)
  numOfCards: number = 0;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    if (!data) { debugger; throw new Error("No Data!"); }
    const targetCards = data.getTargets(TARGETTYPE.CARD)
    if (targetCards.length == 0) {
      throw new Error(`no targets`)
    } else {
      for (let i = 0; i < targetCards.length; i++) {
        const cardToDiscard = targetCards[i] as Node;
        const playerOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardToDiscard)!
        const cardComp = cardToDiscard.getComponent(Card)!
        playerOwner.loseSoul(cardToDiscard, true)
        switch (cardComp.type) {
          case CARD_TYPE.MONSTER:
            await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.MONSTER, cardToDiscard, true)
            break;
          case CARD_TYPE.TREASURE:
            await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.TREASURE, cardToDiscard, true)
            break;
          case CARD_TYPE.LOOT:
            await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.LOOT, cardToDiscard, true)
            break;
          case CARD_TYPE.BONUS_SOULS:
            cardToDiscard.destroy()
            // await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.MONSTER, cardToDiscard, true)
            break;
          default:
            break;
        }
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
