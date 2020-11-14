import PreCondition from "./PreCondition";
import Card from "../../Entites/GameEntities/Card";
import { PassiveMeta } from "../../Managers/PassiveManager";
import IdAndName from "../IdAndNameComponent";
import { createNewPreCondition } from "../../reset";
import CardEffect from "../../Entites/CardEffect";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ChainPreConditions extends PreCondition {

  @property([PreCondition])
  preconditionToChain: PreCondition[] = []

  @property(IdAndName)
  preconditionToChainIds: IdAndName[] = []

  setWithOld(old: ChainPreConditions) {
    if (old.preconditionToChain.length > 0) {
      old.preconditionToChain.forEach(preCondition => {
        const newId = createNewPreCondition(this.node, preCondition)
        this.preconditionToChainIds.push(IdAndName.getNew(newId, preCondition.name))
      })
      this.preconditionToChain = null
      old.preconditionToChain = null
      old.preconditionToChainIds = this.preconditionToChainIds
    }
  }

  getPreConditions() {
    const cardEffect = this.node.getComponent(CardEffect)
    return this.preconditionToChainIds.map(ian => cardEffect.getPreCondtion(ian.id))
  }

  testCondition(meta: PassiveMeta) {
    const preconditionToChain = this.getPreConditions()
    for (let i = 0; i < preconditionToChain.length; i++) {
      const preCondition = preconditionToChain[i];
      cc.log(`test precondition ${preCondition.name} in chain precondition in card ${Card.getCardNodeByChild(this.node).name}`)
      if (!preCondition.testCondition(meta)) {
        cc.log(`${preCondition.name} has failed`)
        return false
      }

    }
    return true
  }
}
