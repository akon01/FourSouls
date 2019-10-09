import PreCondition from "./PreCondition";
import Card from "../../Entites/GameEntities/Card";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ChainPreConditions extends PreCondition {

  @property([PreCondition])
  preconditionToChain: PreCondition[] = []

  testCondition(meta: any) {


    for (let i = 0; i < this.preconditionToChain.length; i++) {
      const preCondition = this.preconditionToChain[i];
      if (!preCondition.testCondition(meta)) {
        return false
      }

    }
    return true
  }
}
