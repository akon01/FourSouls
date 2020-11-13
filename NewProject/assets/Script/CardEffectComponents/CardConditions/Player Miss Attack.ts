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
export default class PlayerLandAttack extends Condition {

  event = PASSIVE_EVENTS.PLAYER_MISS_ATTACK

  @property
  isOnSpecificRoll: boolean = false

  @property({
    type: [cc.Integer], visible: function (this: PlayerLandAttack) {
      if (this.isOnSpecificRoll) { return true }
    }
  })
  specificRolls: number[] = []

  @property
  isOnSpecificMonster: boolean = false;

  @property({
    type: cc.Node, visible: function (this: PlayerLandAttack) {
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
    if (this.isOnSpecificRoll) {
      let isTrue = false;
      for (const roll of this.specificRolls) {
        if (meta.args[0] == roll) {
          isTrue = true
          break;
        }
      }
      if (!isTrue) {
        answer = false;
      }
    }
    return answer
  }
}
