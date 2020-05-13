import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
import BattleManager from "../../Managers/BattleManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import TurnsManager from "../../Managers/TurnsManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import { TARGETTYPE } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DoubleMonsterReward extends Effect {
  effectName = "DoubleMonsterReward";

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    const monsterWithReward = data.getTarget(TARGETTYPE.MONSTER) as cc.Node
    if (!monsterWithReward) {
      throw new Error(`No Monster With Reward Found`)
    }

    monsterWithReward.getComponent(Monster).reward.doubleReward = true


    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
