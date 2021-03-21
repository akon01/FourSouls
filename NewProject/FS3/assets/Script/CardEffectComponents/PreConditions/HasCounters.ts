import { log, _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PreCondition } from "./PreCondition";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('HasCounters')
export class HasCounters extends PreCondition {
  @property
  countersNeeded: number = 1;
  testCondition(meta: any) {
    let thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    let thisCardComp = thisCard.getComponent(Card)!
    log(`test if ${thisCard.name} has counters`)
    if (
      thisCardComp._counters >= this.countersNeeded
    ) {
      return true;
    } else {
      return false;
    }
  }
}
