import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { PassiveEffectData } from "../Managers/PassiveEffectData";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { Store } from "../Entites/GameEntities/Store";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('CreditCardEffect2')
export class CreditCardEffect2 extends Effect {
  effectName = "CreditCardEffect2";
  originalCost: number = 0
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData
  ) {
    WrapperProvider.storeWrapper.out.storeCardsCost = this.originalCost
    return data
  }
}
