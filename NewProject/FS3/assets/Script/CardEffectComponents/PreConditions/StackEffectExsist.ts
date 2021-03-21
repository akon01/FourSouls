import { Enum, log, _decorator } from 'cc';
import { STACK_EFFECT_TYPE } from "../../Constants";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { PreCondition } from "./PreCondition";
const { ccclass, property } = _decorator;


@ccclass('StackEffectExsist')
export class StackEffectExsist extends PreCondition {
  @property({
    type: Enum(STACK_EFFECT_TYPE), visible: function (this: StackEffectExsist) {
      return !this.multiType

    }
  })
  typeToExsist: STACK_EFFECT_TYPE = 1
  @property
  multiType: boolean = false;
  @property({
    type: [Enum(STACK_EFFECT_TYPE)], visible: function (this: StackEffectExsist) {
      return this.multiType
    }
  })
  typesToExsist: STACK_EFFECT_TYPE[] = [];


  testCondition(meta: any) {

    if (this.multiType) {
      let exsist = false
      for (const type of this.typesToExsist) {
        exsist = this.checkIfExsist(type)
        if (exsist) {
          break;
        }
      }
      return exsist
    } else {
      return this.checkIfExsist(this.typeToExsist)
    }
  }
  checkIfExsist(typeToCheck: STACK_EFFECT_TYPE) {
    for (const stackEffect of WrapperProvider.stackWrapper.out._currentStack) {
      if (stackEffect.stackEffectType == typeToCheck) {
        log(`stack effect exsists`)
        return true
      }
    }
    return false
  }
}
