import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import { PassiveMeta } from "../../Managers/PassiveManager";
import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import DataCollector from "../DataCollector/DataCollector";

const { ccclass, property } = cc._decorator;


@ccclass
export default class EntityTakeDamage extends Condition {

  @property({ type: DataCollector, tooltip: 'Only Put If Not In "Add Passive Effect" Active effect' })
  dataCollector: DataCollector = null

  @property
  isSpecificToEntityTakesDamage: boolean = false;

  @property({
    type: cc.Node, visible: function (this: EntityTakeDamage) {
      if (this.isSpecificToEntityTakesDamage) return true
    }
  })
  entityWhoTookDamage: cc.Node = null;

  event = null
  events = [PASSIVE_EVENTS.MONSTER_GET_HIT, PASSIVE_EVENTS.PLAYER_GET_HIT]

  async testCondition(meta: PassiveMeta) {
    let scope;
    scope = meta.methodScope.getComponent(Player);
    if (!scope) scope = meta.methodScope.getComponent(Monster)
    let thisCard = this.node.parent.parent;
    let target
    let event = PASSIVE_EVENTS.MONSTER_GET_HIT
    if (!this.isSpecificToEntityTakesDamage) {

      let subject = this.conditionData.getTarget(TARGETTYPE.PLAYER)
      let isAPlayer = true
      if (!subject) {
        subject = this.conditionData.getTarget(TARGETTYPE.MONSTER)
        isAPlayer = false;
      }
      if (isAPlayer) {
        target = PlayerManager.getPlayerByCard(thisCard);
        event = PASSIVE_EVENTS.PLAYER_GET_HIT
      }
    } else {
      target = this.entityWhoTookDamage
    }
    let answer = false;
    if (
      scope.name == target.name &&
      meta.passiveEvent == event
    ) answer = true;
    if (this.isSpecificToEntityTakesDamage) {
      cc.log(`entity who took damage is ${scope.name}`)
      if (this.entityWhoTookDamage == scope.node) {
        answer = true
      } else answer = false;
    }
    return answer
  }
}
