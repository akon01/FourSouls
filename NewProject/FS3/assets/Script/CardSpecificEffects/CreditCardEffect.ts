import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { PassiveEffectData } from "../Managers/PassiveEffectData";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { Store } from "../Entites/GameEntities/Store";
import { CreditCardEffect2 } from "./CreditCardEffect2";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('CreditCardEffect')
export class CreditCardEffect extends Effect {
  effectName = "CreditCardEffect";
  noDataCollector = true
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData
  ) {
    let originalCost = WrapperProvider.storeWrapper.out.storeCardsCost;
    WrapperProvider.storeWrapper.out.storeCardsCost = 0;
    this.node.getComponent(CreditCardEffect2)!.originalCost = originalCost;
    return data
  }
}
