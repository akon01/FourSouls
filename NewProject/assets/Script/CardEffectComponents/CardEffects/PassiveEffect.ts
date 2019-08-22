import { PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PassiveEffect extends Effect {


  /**
   *
   * @param data {target:Player}
   */
  async doEffect(stack: StackEffectInterface[], data: PassiveEffectData) {
    return data;
  }

  reverseEffect() {

  }

  onLoad() {
    this._effectCard = this.node.parent;
  }

  // toString() {
  //   return `${this.hasSubAction},${this.passiveType},${this.passiveEffectToAdd.toString()},${this.effectName}.${this.chooseType}`
  // }
}
