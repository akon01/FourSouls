import PreCondition from "./PreCondition";
import Card from "../../Entites/GameEntities/Card";
import { PassiveMeta } from "../../Managers/PassiveManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ChainPreConditions extends PreCondition {

  @property([PreCondition])
  preconditionToChain: PreCondition[] = []

  testCondition(meta: PassiveMeta) {


    for (let i = 0; i < this.preconditionToChain.length; i++) {
      const preCondition = this.preconditionToChain[i];
      cc.log(`test precondition ${preCondition.name} in chain precondition in card ${Card.getCardNodeByChild(this.node).name}`)
      if (!preCondition.testCondition(meta)) {
        cc.log(`${preCondition.name} has failed`)
        return false
      }

    }
    return true
  }
}
