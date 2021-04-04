import { _decorator } from 'cc';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
const { ccclass, property } = _decorator;


import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";

@ccclass('PassiveEffect')
export class PassiveEffect extends Effect {
      /**
       *
       * @param data {target:Player}
       */
      async doEffect(stack: StackEffectInterface[], data: PassiveEffectData) {
            return data;
      }
      reverseEffect() {

      }

}
