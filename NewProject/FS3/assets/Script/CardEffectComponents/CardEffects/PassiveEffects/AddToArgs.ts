import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PassiveEffect } from "../PassiveEffect";
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { PassiveEffectData } from "../../../Managers/PassiveEffectData";
import { DataCollector } from '../../DataCollector/DataCollector';
import { TARGETTYPE } from '../../../Constants';

@ccclass('AddToArgs')
export class AddToArgs extends PassiveEffect {
      effectName = "AddToArgs";
      @property
      argsIndex: number = 0;

      @property({ visible: function (this: AddToArgs) { return !this.isHowMuchFromDataCollector } })
      howMuchToAdd: number = 0

      @property
      isHowMuchFromDataCollector: boolean = false;



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
