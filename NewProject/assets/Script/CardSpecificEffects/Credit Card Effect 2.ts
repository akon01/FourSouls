import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { PassiveEffectData } from "../Managers/DataInterpreter";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import Store from "../Entites/GameEntities/Store";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CreditCardEffect2 extends Effect {
  effectName = "CreditCardEffect2";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  originalCost: number = 0


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData
  ) {
    Store.storeCardsCost = this.originalCost

    return data
  }


}