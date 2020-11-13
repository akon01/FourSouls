import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import { PassiveMeta } from "../../Managers/PassiveManager";
import Condition from "./Condition";
import DataCollector from "../DataCollector/DataCollector";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerLoseThisItem extends Condition {

  event = PASSIVE_EVENTS.PLAYER_LOSE_ITEM

  conditionData: ActiveEffectData = null;

  async testCondition(meta: PassiveMeta) {

    let player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node)
    if (
      player instanceof Player &&
      // meta.passiveEvent == PASSIVE_EVENTS.PLAYER_ADD_ITEM &&
      thisCard == meta.args[0]
    ) {
      return true;
    } else {
      return false;
    }

  }
}
