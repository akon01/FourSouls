import Effect from "../CardEffectComponents/CardEffects/Effect";
import Monster from "../Entites/CardTypes/Monster";
import Stack from "../Entites/Stack";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import MonsterDeath from "../StackEffects/Monster Death";
import StackEffectInterface from "../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass("HeadlessHorsmanEffect")
export default class HeadlessHorsmanEffect extends Effect {
  effectName = "HeadlessHorsmanEffect";


  @property(Monster)
  headlessHorsmanCard: Monster = null

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {
    const deathStackEffect = Stack._currentStack.find(s => s instanceof MonsterDeath && s.monsterToDie == this.headlessHorsmanCard)
    //debugger
    Stack.fizzleStackEffect(deathStackEffect, true, true)
    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
