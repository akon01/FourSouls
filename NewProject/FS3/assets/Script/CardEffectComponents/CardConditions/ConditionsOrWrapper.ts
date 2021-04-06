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
  async testCondition(meta: PassiveMeta): Promise<boolean> {
    let answer = false
    for (const condition of this.conditions) {
      answer = await condition.testCondition(meta)
      if (answer == true) {
        return answer
      }
    }

    return false;
  }
}