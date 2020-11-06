import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import Monster from "../Entites/CardTypes/Monster";
import Deck from "../Entites/GameEntities/Deck";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import PlayerManager from "../Managers/PlayerManager";
import MonsterDeath from "../StackEffects/Monster Death";
import StackEffectInterface from "../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeadlessHorsmanEffect extends Effect {
  effectName = "HeadlessHorsmanEffect";


  @property(Monster)
  headlessHorsmanCard:Monster = null

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData|PassiveEffectData
  ) {
    const deathStackEffect = Stack._currentStack.find(s=>s instanceof MonsterDeath && s.monsterToDie==this.headlessHorsmanCard)
    //debugger
    Stack.fizzleStackEffect(deathStackEffect,true,true)
    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
