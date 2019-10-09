import Player from "../../Entites/GameEntities/Player";
import BattleManager from "../../Managers/BattleManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import TurnsManager from "../../Managers/TurnsManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CancelAttack extends Effect {
  effectName = "CancelAttack";



  @property
  addAttackOppurtunity: boolean = false;

  @property({ visible: function (this: CancelAttack) { if (this.addAttackOppurtunity) return true } })
  howMuchToAdd: number = 1;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    let player: Player = TurnsManager.currentTurn.getTurnPlayer();
    await BattleManager.cancelAttack(true);
    if (this.addAttackOppurtunity) TurnsManager.currentTurn.attackPlays = TurnsManager.currentTurn.attackPlays + this.howMuchToAdd


    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
