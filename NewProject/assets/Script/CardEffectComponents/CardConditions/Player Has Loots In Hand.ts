import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass("PlayerHasLootInHand")
export default class PlayerHasLootInHand extends Condition {

  events = [PASSIVE_EVENTS.PLAYER_LOSE_LOOT, PASSIVE_EVENTS.PLAYER_GAIN_LOOT]

  @property
  numOfLootsNeeded: number = 1

  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    const player: Player = meta.methodScope.getComponent(Player);
    if (
      player instanceof Player &&
      player.getHandCards().length == this.numOfLootsNeeded &&
      this.events.includes(meta.passiveEvent)
    ) {
      return true;
    } else {
      return false;
    }
  }
}
