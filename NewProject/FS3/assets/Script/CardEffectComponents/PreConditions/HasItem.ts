import { log, _decorator, Node } from 'cc';
import { Item } from "../../Entites/CardTypes/Item";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { PreCondition } from "./PreCondition";
const { ccclass, property } = _decorator;


@ccclass('HasItem')
export class HasItem extends PreCondition {
  @property
  itemsNeeded: number = 1;

  @property(Node)
  excludeFromCount: Node | null = null

  testCondition(meta: any) {
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    const owner = WrapperProvider.cardManagerWrapper.out.getCardOwner(thisCard)!;
    if (owner) {
      const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(owner)!
      let playerItems = [...player.getActiveItems().filter(item => { if (!item.getComponent(Item)!.eternal) { return true } }),
      ...player.getPassiveItems().filter(item => { if (!item.getComponent(Item)!.eternal) { return true } }),
      ...player.getPaidItems().filter(item => { if (!item.getComponent(Item)!.eternal) { return true } })]
      playerItems = playerItems.filter(i => i != this.excludeFromCount)
      if (playerItems.length >= this.itemsNeeded) {
        return true
      } else {
        return false
      }
    } else {
      throw new Error(`no owner for this card ${thisCard}`)
    }
  }
}
