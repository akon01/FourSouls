import { PASSIVE_EVENTS } from "../../Constants";
import Card from "../../Entites/GameEntities/Card";
import { PassiveMeta } from "../../Managers/PassiveManager";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardHasCounters extends Condition {

  event = PASSIVE_EVENTS.CARD_GAINS_COUNTER

  @property
  thisCardOnly: boolean = false;

  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {

    const card = meta.methodScope.getComponent(Card);
    const thisCard = Card.getCardNodeByChild(this.node)
    let answer = true
    if (this.thisCardOnly) {
      if (!(thisCard.name == card.node.name)) { answer = false }
    }
    return answer
  }
}
