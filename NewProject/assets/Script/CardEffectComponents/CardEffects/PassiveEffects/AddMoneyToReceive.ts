import { PassiveEffectData } from "../../../Managers/DataInterpreter";
import StackEffectInterface from "../../../StackEffects/StackEffectInterface";
import PassiveEffect from "../PassiveEffect";



const { ccclass, property } = cc._decorator;

@ccclass
export default class AddMoneyToReceive extends PassiveEffect {
  effectName = "AddMoneyToReceive";


  @property(cc.Integer)
  numOfCoins: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    let terminateOriginal = data.terminateOriginal;
    let args = data.methodArgs;
    //should be money count
    args[0] = args[0] + this.numOfCoins
    return data
  }
}
