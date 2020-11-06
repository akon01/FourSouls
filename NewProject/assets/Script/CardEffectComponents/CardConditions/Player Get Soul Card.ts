import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import DataCollector from "../DataCollector/DataCollector";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerGetSoulCard extends Condition {

  event = PASSIVE_EVENTS.PLAYER_GET_SOUL_CARD

  @property({ type: DataCollector, tooltip: 'Only Put If Not In "Add Passive Effect" Active effect' })
  dataCollector: DataCollector = null

  @property
  isOnSpecificMonster: boolean = false;

  @property({
    type: cc.Node, visible: function (this: PlayerGetSoulCard) {
      if (this.isOnSpecificMonster) { return true }
    }
  })
  specificMonster: cc.Node = null

  conditionData: ActiveEffectData = null;

  async testCondition(meta: PassiveMeta) {
    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node);
    let answer = true
    if (!(player instanceof Player)) {
      answer = false;
    }
    if (this.isOnSpecificMonster) {
      if (this.specificMonster != meta.args[1].node) {
        answer = false;
      }
    }
    return answer
  }
}
