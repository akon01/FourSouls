import { _decorator,Node } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Item } from '../../Entites/CardTypes/Item';
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('CardIsAddedToPile')
export class CardIsAddedToPile extends Condition {
  event = PASSIVE_EVENTS.CARD_ADDED_TO_PILE

  @property
  isSpecificCardToGetAdded = false

  @property({
    visible: function (this: CardIsAddedToPile) {
      return this.isSpecificCardToGetAdded
    }, type: Item
  })
  specificCardToGetAdded: Node | null = null

  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const cardAdded = meta.methodScope
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    let answer = true;
    if (this.isSpecificCardToGetAdded) {
      if (this.specificCardToGetAdded !== cardAdded) {
        answer = false
      }
    }
    return answer
  }
}
