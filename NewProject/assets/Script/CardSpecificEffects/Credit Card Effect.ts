import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { PassiveEffectData } from "../Managers/DataInterpreter";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import Store from "../Entites/GameEntities/Store";
import CreditCardEffect2 from "./Credit Card Effect 2";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CreditCardEffect extends Effect {
  effectName = "CreditCardEffect";

  @property({ type: DataCollector, override: true })
  dataCollector = null;



  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData
  ) {
    let originalCost = Store.storeCardsCost;
    Store.storeCardsCost = 0;
    this.node.parent.getChildByName('Credit Card Effect 2').getComponent(CreditCardEffect2).originalCost = originalCost;
    return data
  }

}
