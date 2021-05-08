import { _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Item } from '../../Entites/CardTypes/Item';
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('ItemIsDestroyed')
export class ItemIsDestroyed extends Condition {
  event = PASSIVE_EVENTS.ITEM_DESTROY

  @property
  isSpecificItem = false

  @property({
    visible: function (this: ItemIsDestroyed) {
      return this.isSpecificItem
    }, type: Item
  })
  specificItemToBeDestroyed: Item | null = null

  testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const item = meta.methodScope.getComponent(Item)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    let answer = true;
    if (!(item instanceof Item)) {
      answer = false
    }
    if (this.isSpecificItem) {
      if (this.specificItemToBeDestroyed !== item) {
        answer = false
      }
    }
    return Promise.resolve(answer);
  }
}
