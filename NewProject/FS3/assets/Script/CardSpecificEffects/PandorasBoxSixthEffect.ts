import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { CardManager } from "../Managers/CardManager";
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { PlayerManager } from "../Managers/PlayerManager";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { Card } from "../Entites/GameEntities/Card";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('PandorasBoxSixthEffect')
export class PandorasBoxSixthEffect extends Effect {
  effectName = "PandorasBoxSixthEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData | ActiveEffectData
  ) {
    let thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    let thisOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(WrapperProvider.cardManagerWrapper.out.getCardOwner(thisCard)!)!
    await thisOwner.receiveSoulCard(thisCard, true)
    if (data instanceof PassiveEffectData) {
      return data
    }
    return stack
  }
}
