import { _decorator, Node } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Item } from '../../Entites/CardTypes/Item';
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('CardIsRemovedFromPile')
export class CardIsRemovedFromPile extends Condition {
  event = PASSIVE_EVENTS.CARD_REMOVED_FROM_PILE

  @property
  isSpecificCardToGetRemoved = false

  @property({
    visible: function (this: CardIsRemovedFromPile) {
      return this.isSpecificCardToGetRemoved
    }, type: Item
  })
  specificCardToGetRemoved: Node | null = null

  testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const cardAdded = meta.methodScope
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    let answer = true;
    if (this.isSpecificCardToGetRemoved) {
      if (this.specificCardToGetRemoved !== cardAdded) {
        answer = false
      }
    }
    return Promise.resolve(answer);
  }
}
