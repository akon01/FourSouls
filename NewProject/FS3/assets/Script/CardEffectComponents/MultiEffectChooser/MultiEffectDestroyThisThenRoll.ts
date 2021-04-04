import { Enum, log, Node, _decorator } from 'cc';
import { ITEM_TYPE } from "../../Constants";
import { EffectsAndNumbers } from "../../EffectsAndNumbers";
import { CardEffect } from "../../Entites/CardEffect";
import { Card } from "../../Entites/GameEntities/Card";
import { PileManager } from "../../Managers/PileManager";
import { PlayerManager } from "../../Managers/PlayerManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Effect } from "../CardEffects/Effect";
import { IMultiEffectRollAndCollect } from "./IMultiEffectRollAndCollect";
const { ccclass, property } = _decorator;


@ccclass('MultiEffectDestroyThisThenRoll')
export class MultiEffectDestroyThisThenRoll extends IMultiEffectRollAndCollect {
  collectorName = "MultiEffectDestroyThisThenRoll";
  @property({ type: Enum(ITEM_TYPE) })
  effectsType: ITEM_TYPE = ITEM_TYPE.ACTIVE;
  @property({ type: [EffectsAndNumbers], multiline: true })
  effectsAndNumbers: EffectsAndNumbers[] = [];

  /**
   *
   * @param data {cardPlayed}
   */
  async collectData(data: {
    cardPlayed: Node;
    cardPlayerId: number;
  }): Promise<null> {
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const thisOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!
    await thisOwner.loseItem(thisCard, true)
    await WrapperProvider.pileManagerWrapper.out.addCardToPile(thisCard.getComponent(Card)!.type, thisCard, true)
    return null
  }
  getEffectByNumberRolled(numberRolled: number, cardPlayed: Node) {
    const cardEffectComp = cardPlayed.getComponent(CardEffect)!;
    let chosenEffect: Effect | null = null;
    for (let i = 0; i < this.effectsAndNumbers.length; i++) {
      const eAn = this.effectsAndNumbers[i];
      const index = eAn.numbers.find((number) => { if (number == numberRolled) { return true } })
      if (index != null) {
        chosenEffect = eAn.effect

        break;
      }

    }
    if (!chosenEffect) {
      console.log(this.effectsAndNumbers.map(ean => ean.effect!.name + "" + ean.numbers))
      throw new Error(`No effect was chosen with the number rolled ${numberRolled}`)
    }
    console.log(chosenEffect.name)
    return chosenEffect;

  }
  onLoad() {
    const cardEffectComp = this.node.getComponent(CardEffect)!
    this.effectsAndNumbers.forEach(ean => ean.effect = cardEffectComp.getEffect(ean.effectIdFinal))
  }
}
