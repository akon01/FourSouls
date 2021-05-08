import { Node, _decorator } from 'cc';
import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import { Character } from "../../Entites/CardTypes/Character";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Player } from "../../Entites/GameEntities/Player";
import { IAttackableEntity } from '../../Entites/IAttackableEntity';
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
import { CheckEggCounterConditionProp } from './ConditionsProperties/CheckEggCounterConditionProp';
import { CheckIsEntityAttackableConditionProp } from './ConditionsProperties/CheckIsEntityAttackableConditionProp';
const { ccclass, property } = _decorator;


@ccclass('EntityLoseEggCounter')
export class EntityLoseEggCounter extends Condition {
  @property
  isSpecificToEntityWhoGetsCounter = false;
  //@ts-ignore
  @property({
    type: Node, visible: function (this: EntityLoseEggCounter) {
      if (this.isSpecificToEntityWhoGetsCounter) { return true }
    }
  })
  entityWhoGotCounter: Node | null = null;

  @property({
    visible: function (this: EntityLoseEggCounter) {
      return !this.isOnlyMonsters
    }
  })
  isOnlyPlayers = false

  @property({
    visible: function (this: EntityLoseEggCounter) {
      return !this.isOnlyPlayers
    }
  })
  isOnlyMonsters = false

  @property(CheckIsEntityAttackableConditionProp)
  checkIsEntityAttackableConditionProp: CheckIsEntityAttackableConditionProp = new CheckIsEntityAttackableConditionProp()

  @property(CheckEggCounterConditionProp)
  checkEggCounter: CheckEggCounterConditionProp = new CheckEggCounterConditionProp()

  event = PASSIVE_EVENTS.EGG_COUNTER_REMOVED
  //  events = [PASSIVE_EVENTS.MONSTER_GET_HIT, PASSIVE_EVENTS.PLAYER_GET_HIT]
  testCondition(meta: PassiveMeta) {
    let scope: Player | Monster | null = null;
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    scope = meta.methodScope.getComponent(Player)!;
    if (!scope) { scope = meta.methodScope.getComponent(Monster)! }
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    let target: Node | null = null
    let isAPlayer = true
    let subject: Node | null = null
    if (this.conditionData != null || this.conditionData != undefined) {
      subject = this.conditionData.getTarget(TARGETTYPE.PLAYER) as Node
      if (!subject) {
        subject = this.conditionData.getTarget(TARGETTYPE.MONSTER) as Node
        isAPlayer = false;
      }
      // if (isAPlayer) {
      //   target = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard);
      // }
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
    if (this.isOnlyMonsters) {
      if (scope instanceof Player) {
        answer = false
      }
    }
    if (this.isOnlyPlayers) {
      if (scope instanceof Monster) {
        answer = false
      }
    }
    if (this.checkIsEntityAttackableConditionProp.doCheck) {
      const attackableComp = target!.getComponent(Monster) ?? target!.getComponent(Player)
      answer = this.checkIsEntityAttackableConditionProp.CheckEntity(attackableComp!, answer)
    }
    if (this.checkEggCounter.checkIfMonsterHasEggCoutners) {
      const eggableComp = target!.getComponent(Monster) ?? target!.getComponent(Player)
      answer = this.checkEggCounter.checkEntity(eggableComp!, answer)
    }
    return Promise.resolve(answer);
  }
}
