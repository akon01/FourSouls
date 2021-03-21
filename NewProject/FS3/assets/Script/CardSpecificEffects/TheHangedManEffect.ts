import { Node, _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { CARD_TYPE, TARGETTYPE } from "../Constants";
import { Card } from "../Entites/GameEntities/Card";
import { Deck } from "../Entites/GameEntities/Deck";
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { WrapperProvider } from '../Managers/WrapperProvider';
const { ccclass } = _decorator;


@ccclass('TheHangedManEffect')
export class TheHangedManEffect extends Effect {
  effectName = "TheHangedManEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {
    const targetCards = data.getTargets(TARGETTYPE.CARD)
    if (targetCards == null || targetCards.length == 0) {
      throw new Error("no targets")
    } else {
      const selectedToPutOnBottom = await WrapperProvider.cardPreviewManagerWrapper.out.selectFromCards(targetCards as Node[], 3)
      for (let i = 0; i < selectedToPutOnBottom.length; i++) {
        const card = selectedToPutOnBottom[i].getComponent(Card)!;

        switch (card.type) {
          case CARD_TYPE.LOOT:
            WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck)!.addToDeckOnBottom(card.node, 0, true)
            break;
          case CARD_TYPE.MONSTER:
            WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!.addToDeckOnBottom(card.node, 0, true)
            break
          case CARD_TYPE.TREASURE:
            WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!.addToDeckOnBottom(card.node, 0, true)
          default:
            break;
        }
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return stack
  }
}