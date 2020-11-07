import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import { PassiveMeta } from "../../Managers/PassiveManager";
import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import DataCollector from "../DataCollector/DataCollector";
import Card from "../../Entites/GameEntities/Card";
import Character from "../../Entites/CardTypes/Character";

const { ccclass, property } = cc._decorator;


@ccclass
export default class EntityTakeDamage extends Condition {

  @property({ type: DataCollector, tooltip: 'Only Put If Not In "Add Passive Effect" Active effect' })
  dataCollector: DataCollector = null

  @property
  isSpecificToEntityTakesDamage: boolean = false;

  @property({
    type: cc.Node, visible: function (this: EntityTakeDamage) {
      if (this.isSpecificToEntityTakesDamage) { return true }
    }
  })
  entityWhoTookDamage: cc.Node = null;

  @property
  isSpesificRoll: boolean = false;

  @property({
    visible: function (this: EntityTakeDamage) {
      return this.isSpesificRoll
    }
  })
  specificRoll: number = 1

  event = null
  events = [PASSIVE_EVENTS.MONSTER_GET_HIT, PASSIVE_EVENTS.PLAYER_GET_HIT]

  async testCondition(meta: PassiveMeta) {
    let scope;
    scope = meta.methodScope.getComponent(Player);
    if (!scope) { scope = meta.methodScope.getComponent(Monster) }
    const thisCard = Card.getCardNodeByChild(this.node);
    let target
    let isAPlayer = true
    let subject
    debugger
    if (this.conditionData != null || this.conditionData != undefined) {
      subject = this.conditionData.getTarget(TARGETTYPE.PLAYER) as cc.Node
      if (!subject) {
        subject = this.conditionData.getTarget(TARGETTYPE.MONSTER) as cc.Node
        isAPlayer = false;
      }
      if (isAPlayer) {
        target = PlayerManager.getPlayerByCard(thisCard);
      }
    }
    if (this.isSpecificToEntityTakesDamage) {
      if (this.entityWhoTookDamage != null) {
        target = this.entityWhoTookDamage
      } else if (isAPlayer) {
        target = subject.getComponent(Character).player.node
      } else {
        target = subject.getComponent(Monster).node
      }
    }
    let answer = true;
    if (this.events.includes(meta.passiveEvent)) {
      if (this.isSpecificToEntityTakesDamage) {
        if (target != scope.node) {
          answer = false;
        }
      }
      if (this.isSpesificRoll) {
        if (this.specificRoll != meta.args[2]) {
          answer = false
        }
      }
    } else {
      answer = false
    }
    return answer
  }
}
