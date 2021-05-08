import { _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Card } from "../../Entites/GameEntities/Card";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('PlayerAddThisItem')
export class PlayerAddThisItem extends Condition {
  event = PASSIVE_EVENTS.PLAYER_ADD_ITEM


  testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    if (
      player instanceof Player &&
      // meta.passiveEvent == PASSIVE_EVENTS.PLAYER_ADD_ITEM &&
      thisCard == meta.args[0]
    ) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }

  }
}