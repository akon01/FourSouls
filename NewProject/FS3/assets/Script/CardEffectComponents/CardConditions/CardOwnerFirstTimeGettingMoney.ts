import { _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('CardOwnerFirstTimeGettingMoney')
export class CardOwnerFirstTimeGettingMoney extends Condition {
  event = PASSIVE_EVENTS.PLAYER_CHANGE_MONEY
  needsDataCollector = false;

  testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      player._isFirstTimeGettingMoney &&
      meta.args[0] > 0
    ) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
}