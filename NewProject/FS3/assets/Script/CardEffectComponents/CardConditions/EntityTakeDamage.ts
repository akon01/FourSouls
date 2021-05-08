import { Node, _decorator } from 'cc';
import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import { Character } from "../../Entites/CardTypes/Character";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('EntityTakeDamage')
export class EntityTakeDamage extends Condition {
  @property
  isSpecificToEntityTakesDamage = false;
  //@ts-ignore
  @property({
    type: Node, visible: function (this: EntityTakeDamage) {
      if (this.isSpecificToEntityTakesDamage) { return true }
    }
  })
  entityWhoTookDamage: Node | null = null;
  @property
  isSpesificRoll = false;
  //@ts-ignore
  @property({
    visible: function (this: EntityTakeDamage) {
      return this.isSpesificRoll
    }
  })
  specificRoll = 1
  event = null
  events = [PASSIVE_EVENTS.MONSTER_GET_HIT, PASSIVE_EVENTS.PLAYER_GET_HIT]
  testCondition(meta: PassiveMeta) {
    let scope: Player | Monster | null = null;
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    scope = meta.methodScope.getComponent(Player)!;
    if (!scope) { scope = meta.methodScope.getComponent(Monster)! }
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    let target
    let isAPlayer = true
    let subject: Node | null = null
    debugger
    if (this.conditionData != null || this.conditionData != undefined) {
      subject = this.conditionData.getTarget(TARGETTYPE.PLAYER) as Node
      if (!subject) {
        subject = this.conditionData.getTarget(TARGETTYPE.MONSTER) as Node
        isAPlayer = false;
      }
      if (isAPlayer) {
        target = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard);
      }
    }
    if (this.isSpecificToEntityTakesDamage) {
      if (this.entityWhoTookDamage != null) {
        target = this.entityWhoTookDamage
      } else if (isAPlayer) {
        debugger
        if (!subject) { debugger; throw new Error("No Subject"); }

        target = subject.getComponent(Character)!.player!.node
      } else {
        if (!subject) { debugger; throw new Error("No Subject"); }
        target = subject.getComponent(Monster)!.node
      }
    }
    let answer = true;
    if (this.events.indexOf(meta.passiveEvent!) >= 0) {
      if (this.isSpecificToEntityTakesDamage) {
        if (target != scope.node) {
          answer = false;
        }
      }
      if (this.isSpesificRoll) {
        if (!meta.args) { debugger; throw new Error("No Args"); }
        if (this.specificRoll != meta.args[2]) {
          answer = false
        }
      }
    } else {
      answer = false
    }
    return Promise.resolve(answer);
  }
}
