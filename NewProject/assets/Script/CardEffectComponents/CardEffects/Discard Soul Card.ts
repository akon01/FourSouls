import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import Card from "../../Entites/GameEntities/Card";
import Stack from "../../Entites/Stack";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PileManager from "../../Managers/PileManager";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DiscardSoulCard extends Effect {
  effectName = "DiscardSoulCard";

  @property(cc.Integer)
  numOfCards: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    const targetCards = data.getTargets(TARGETTYPE.CARD)
    if (targetCards.length == 0) {
      throw new Error(`no targets`)
    } else {
      for (let i = 0; i < targetCards.length; i++) {
        const cardToDiscard = targetCards[i] as cc.Node;
        const playerOwner = PlayerManager.getPlayerByCard(cardToDiscard)
        const cardComp = cardToDiscard.getComponent(Card)
        playerOwner.loseSoul(cardToDiscard, true)
        switch (cardComp.type) {
          case CARD_TYPE.MONSTER:
            await PileManager.addCardToPile(CARD_TYPE.MONSTER, cardToDiscard, true)
            break;
          case CARD_TYPE.TREASURE:
            await PileManager.addCardToPile(CARD_TYPE.TREASURE, cardToDiscard, true)
            break;
          case CARD_TYPE.LOOT:
            await PileManager.addCardToPile(CARD_TYPE.LOOT, cardToDiscard, true)
            break;
          case CARD_TYPE.BONUS_SOULS:
            cardToDiscard.destroy()
            // await PileManager.addCardToPile(CARD_TYPE.MONSTER, cardToDiscard, true)
            break;
          default:
            break;
        }
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
