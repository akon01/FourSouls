import PreCondition from "./PreCondition";
import Card from "../../Entites/GameEntities/Card";


const { ccclass, property } = cc._decorator;

@ccclass
export default class HasCounters extends PreCondition {

  @property
  countersNeeded: number = 1;

  testCondition(meta: any) {
    let thisCard = Card.getCardNodeByChild(this.node);
    let thisCardComp = thisCard.getComponent(Card)
    cc.log(`test if ${thisCard.name} has counters`)
    if (
      thisCardComp._counters >= this.countersNeeded
    ) {
      return true;
    } else {
      return false;
    }
  }
}
