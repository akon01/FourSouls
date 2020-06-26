import PreCondition from "./PreCondition";
import Card from "../../Entites/GameEntities/Card";
import { STACK_EFFECT_TYPE } from "../../Constants";
import Stack from "../../Entites/Stack";


const { ccclass, property } = cc._decorator;

@ccclass
export default class StackEffectExsists extends PreCondition {

  @property({
    type: cc.Enum(STACK_EFFECT_TYPE), visible: function (this: StackEffectExsists) {
      if (!this.multiType) {
        return true
      }
    }
  })
  typeToExsist: STACK_EFFECT_TYPE = 1

  @property
  multiType: boolean = false;

  @property({
    type: [cc.Enum(STACK_EFFECT_TYPE)], visible: function (this: StackEffectExsists) {
      if (this.multiType) {
        return true
      }
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
    for (const stackEffect of Stack._currentStack) {
      if (stackEffect.stackEffectType == typeToCheck) {
        cc.log(`stack effect exsists`)
        return true
      }
    }
    return false
  }
}
