import Stack from "../../../Entites/Stack";
import { PassiveEffectData } from "../../../Managers/DataInterpreter";
import PlayerManager from "../../../Managers/PlayerManager";
import TurnsManager from "../../../Managers/TurnsManager";
import PlayerDeathPenalties from "../../../StackEffects/Player Death Penalties";
import StackEffectInterface from "../../../StackEffects/StackEffectInterface";
import DataCollector from "../../DataCollector/DataCollector";
import Effect from "../Effect";



const { ccclass, property } = cc._decorator;

@ccclass
export default class InfiniteAttack extends Effect {
  effectName = "InfiniteAttack";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {

    TurnsManager.currentTurn.attackPlays += 1;

    return data
  }
}
