import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Card } from "../../Entites/GameEntities/Card";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";

@ccclass('CardHasCounters')
export class CardHasCounters extends Condition {
  event = PASSIVE_EVENTS.CARD_GAINS_COUNTER
  @property
  numOfCounters = 0;

  @property
  isExsactCounterNumber = false

  @property
  thisCardOnly: boolean = false;

  needsDataCollector = false;
  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    const card = meta.methodScope.getComponent(Card)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    let answer = true
    if (this.isExsactCounterNumber) {
      if (card._counters != this.numOfCounters) {
        answer = false
      }
    }
    else if (card._counters < this.numOfCounters) {
      answer = false
    }
    if (this.thisCardOnly) {
      if (!(thisCard.name == card.node.name)) { answer = false }
    }
    return answer
  }
}
