import StackEffectInterface from "../../../StackEffects/StackEffectInterface";

import Effect from "../Effect";
import DataCollector from "../../DataCollector/DataCollector";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PreventDeathPenalties extends Effect {
  effectName = "PreventDeathPenalties";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], args?) {
    let terminateOriginal = args.terminateOriginal;
    terminateOriginal = true;
    let args2 = args.newArgs;

    return new Promise<{ terminateOriginal: boolean, newArgs: any }>((resolve, reject) => {
      resolve({ terminateOriginal: terminateOriginal, newArgs: args2 });
    });
  }
}
