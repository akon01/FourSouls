import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import { PassiveMeta } from "../../Managers/PassiveManager";
import Condition from "./Condition";
import DataCollector from "../DataCollector/DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerAddThisItem extends Condition {

  event = PASSIVE_EVENTS.PLAYER_ADD_ITEM

  @property({ type: DataCollector, tooltip: 'Only Put If Not In "Add Passive Effect" Active effect' })
  dataCollector: DataCollector = null


  conditionData: ActiveEffectData = null;

  async testCondition(meta: PassiveMeta) {

    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
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