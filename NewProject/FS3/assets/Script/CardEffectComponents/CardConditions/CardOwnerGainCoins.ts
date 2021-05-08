import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('CardOwnerGainCoins')
export class CardOwnerGainCoins extends Condition {
  event = PASSIVE_EVENTS.PLAYER_CHANGE_MONEY
  needsDataCollector = false;

  @property
  isOnlyNotCardOwner = false

  testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    let answer = true
    if (!(player instanceof Player)) {
      answer = false
    }
    if (this.isOnlyNotCardOwner) {
      if (player.name == cardOwner.name) {
        answer = false
      }
    } else {
      if (!(player.name == cardOwner.name)) {
        answer = false
      }
    }
    if (!(meta.args[0] > 0)) {
      answer = false
    }
    return Promise.resolve(answer);
  }
}
