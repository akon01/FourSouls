import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass("PlayerHasCoins")
export default class PlayerHasCoins extends Condition {

  event = PASSIVE_EVENTS.PLAYER_CHANGE_MONEY

  @property
  numOfMoneyNeeded: number = 1

  @property
  isOneTimeOnly: boolean = false

  isFirstTime = true

  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    if (this.isOneTimeOnly && !this.isFirstTime) return false;
    const player: Player = meta.methodScope.getComponent(Player);
    if (
      player instanceof Player &&
      player.coins >= this.numOfMoneyNeeded &&
      this.event == meta.passiveEvent
    ) {

      return true;
    } else {
      return false;
    }
  }
}
