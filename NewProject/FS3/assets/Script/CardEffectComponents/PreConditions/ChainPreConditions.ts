import { _decorator, CCInteger, log, Component } from 'cc';
const { ccclass, property } = _decorator;

import { PreCondition } from "./PreCondition";
import { Card } from "../../Entites/GameEntities/Card";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { IdAndNameComponent as IdAndName } from "../IdAndNameComponent";
import { CardEffect } from "../../Entites/CardEffect";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('ChainPreConditions')
export class ChainPreConditions extends PreCondition {
      @property([CCInteger])
      preconditionToChainIdsFinal: number[] = []

      @property([PreCondition])
      preconditionToChain: PreCondition[] = []

      getPreConditions() {
            return this.preconditionToChain
            // const cardEffect = this.node.getComponent(CardEffect)!
            // return this.preconditionToChainIdsFinal.map(ian => cardEffect.getPreCondtion(ian))
      }
      testCondition(meta: PassiveMeta) {
            const preconditionToChain = this.getPreConditions()
            for (let i = 0; i < preconditionToChain.length; i++) {
                  const preCondition = preconditionToChain[i];
                  console.log(`test precondition ${preCondition.name} in chain precondition in card ${WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node).name}`)
                  if (!preCondition.testCondition(meta)) {
                        console.log(`${preCondition.name} has failed`)
                        return false
                  }

            }
            return true
      }
}
