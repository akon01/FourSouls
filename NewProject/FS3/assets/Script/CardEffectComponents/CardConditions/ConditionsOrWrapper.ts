import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { ConditionInterface } from "./ConditionInterface";
import { Condition } from "./Condition";
import { PASSIVE_EVENTS } from '../../Constants';
import { DataCollector } from '../DataCollector/DataCollector';
import { PassiveMeta } from '../../Managers/PassiveMeta';

const getEvents = (conditions: Condition[]) => {
  const events = new Set<PASSIVE_EVENTS>()

  for (const condition of conditions) {
    if (condition.event) {
      events.add(condition.event)
    }
    for (const conditionEvent of condition.events) {
      events.add(conditionEvent)
    }
  }

  return Array.from(events)
}

@ccclass('ConditionsOrWrapper')
export class ConditionsOrWrapper extends Condition implements ConditionInterface {

  @property([Condition])
  conditions: Condition[] = []

  events = getEvents(this.conditions)
  testCondition(meta: PassiveMeta): Promise<boolean> {
    let answer = false
    const index = 0;
    return this.handleTestCondition(index, this.conditions.length, meta)
  }

  private handleTestCondition(index: number, length: number, meta: PassiveMeta): Promise<boolean> {
    const condition = this.conditions[index]
    return condition.testCondition(meta).then(answer => {
      if (answer == true) {
        return answer
      } else {
        return this.handleAfterTestCondition(index++, length, meta)
      }
    }, (res => {
      debugger
      throw new Error("S")
    }))
  }

  private handleAfterTestCondition(index: number, length: number, meta: PassiveMeta): Promise<boolean> {
    if (index < length) {
      return this.handleTestCondition(index, length, meta)
    }
    return Promise.resolve(false)
  }
}


