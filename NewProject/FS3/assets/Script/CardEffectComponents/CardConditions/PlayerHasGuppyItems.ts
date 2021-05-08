import { _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Item } from "../../Entites/CardTypes/Item";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('PlayerHasGuppyItems')
export class PlayerHasGuppyItems extends Condition {
  event = PASSIVE_EVENTS.PLAYER_ADD_ITEM
  @property
  numOfItems = 2;
  testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    if (
      player instanceof Player &&
      player.getDeskCards().filter(item => item.getComponent(Item)!.isGuppyItem).length >= this.numOfItems &&
      this.event == meta.passiveEvent
    ) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }

  }
}
