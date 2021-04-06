import { Node, _decorator } from 'cc';
import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import { Character } from "../../Entites/CardTypes/Character";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('EntityGetEggCounter')
export class EntityGetEggCounter extends Condition {
  @property
  isSpecificToEntityWhoGetsCounter = false;
  //@ts-ignore
  @property({
    type: Node, visible: function (this: EntityGetEggCounter) {
      if (this.isSpecificToEntityWhoGetsCounter) { return true }
    }
  })
  entityWhoGotCounter: Node | null = null;

  event = PASSIVE_EVENTS.EGG_COUNTER_ADDED
  //  events = [PASSIVE_EVENTS.MONSTER_GET_HIT, PASSIVE_EVENTS.PLAYER_GET_HIT]
  async testCondition(meta: PassiveMeta) {
    let scope: Player | Monster | null = null;
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    scope = meta.methodScope.getComponent(Player)!;
    if (!scope) { scope = meta.methodScope.getComponent(Monster)! }
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    let target
    let isAPlayer = true
    let subject: Node | null = null
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
    if (this.isSpecificToEntityWhoGetsCounter) {
      if (this.entityWhoGotCounter != null) {
        target = this.entityWhoGotCounter
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
      if (this.isSpecificToEntityWhoGetsCounter) {
        if (target != scope.node) {
          answer = false;
        }
      }
    } else {
      answer = false
    }
    return answer
  }
}
