import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import { PassiveMeta } from "../../Managers/PassiveManager";
import Condition from "./Condition";
import DataCollector from "../DataCollector/DataCollector";
import Card from "../../Entites/GameEntities/Card";
import Item from "../../Entites/CardTypes/Item";

const { ccclass, property } = cc._decorator;

@ccclass("PlayerHasGuppyItems")
export default class PlayerHasGuppyItems extends Condition {

  event = PASSIVE_EVENTS.PLAYER_ADD_ITEM

  @property
  numOfItems: number = 2;

  conditionData: ActiveEffectData = null;

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    if (
      player instanceof Player &&
      player.getDeskCards().filter(item => item.getComponent(Item).isGuppyItem).length >= this.numOfItems &&
      this.event == meta.passiveEvent
    ) {
      return true;
    } else {
      return false;
    }

  }
}
