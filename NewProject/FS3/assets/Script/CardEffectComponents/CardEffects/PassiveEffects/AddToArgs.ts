import { _decorator } from 'cc';
import { TARGETTYPE } from '../../../Constants';
import { PassiveEffectData } from "../../../Managers/PassiveEffectData";
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { PassiveEffect } from "../PassiveEffect";
const { ccclass, property } = _decorator;


@ccclass('AddToArgs')
export class AddToArgs extends PassiveEffect {
      effectName = "AddToArgs";
      @property
      argsIndex = 0;

      @property({ visible: function (this: AddToArgs) { return !this.isHowMuchFromDataCollector } })
      howMuchToAdd = 0

      @property
      isHowMuchFromDataCollector = false;



      /**
       *
       * @param data {target:PlayerId}
       */
      async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
            if (!data) { debugger; throw new Error("Data Is Undef"); }
            let howMuchToAdd = this.howMuchToAdd
            if (this.isHowMuchFromDataCollector) {
                  howMuchToAdd = data.getTarget(TARGETTYPE.NUMBER) as number
            }
            data.methodArgs[this.argsIndex] += howMuchToAdd
            return data
      }
}
