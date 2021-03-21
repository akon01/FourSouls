import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { TARGETTYPE } from "../Constants";
import { Player } from "../Entites/GameEntities/Player";
import { CardManager } from "../Managers/CardManager";
import { PlayerManager } from "../Managers/PlayerManager";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { CardEffect } from "../Entites/CardEffect";
import { Item } from "../Entites/CardTypes/Item";
import { Card } from "../Entites/GameEntities/Card";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('RemoveAllAbilities')
export class RemoveAllAbilities extends Effect {
  effectName = "RemoveAllAbilities";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {
    const targetCard = data.getTarget(TARGETTYPE.CARD) as Node
    if (targetCard == null) {
      throw new Error("No Target Card Was Found");
    } else {
      const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
      const owner = WrapperProvider.cardManagerWrapper.out.getCardOwner(targetCard)
      if (owner && owner.getComponent(Player)) {
        await owner.getComponent(Player)!.loseItem(thisCard, true)
      }
      const cardEffect = targetCard.getComponent(CardEffect)!
      targetCard.getComponent(Item)!.enabled = false;
      cardEffect.enabled = false
      cardEffect.activeEffects = []
      cardEffect.paidEffects = []
      cardEffect.passiveEffects = []
      cardEffect.toAddPassiveEffects = []
    }
    if (data instanceof PassiveEffectData) { return data }
    return stack
  }
}