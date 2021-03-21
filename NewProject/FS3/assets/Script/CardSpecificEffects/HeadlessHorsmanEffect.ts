import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { Monster } from "../Entites/CardTypes/Monster";
import { Stack } from "../Entites/Stack";
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { MonsterDeath } from "../StackEffects/MonsterDeath";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('HeadlessHorsmanEffect')
export class HeadlessHorsmanEffect extends Effect {
  effectName = "HeadlessHorsmanEffect";
  @property(Monster)
  headlessHorsmanCard: Monster | null = null
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {
    const deathStackEffect = WrapperProvider.stackWrapper.out._currentStack.find(s => s instanceof MonsterDeath && s.monsterToDie == this.headlessHorsmanCard)!
    //debugger
    WrapperProvider.stackWrapper.out.fizzleStackEffect(deathStackEffect, true, true)
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
