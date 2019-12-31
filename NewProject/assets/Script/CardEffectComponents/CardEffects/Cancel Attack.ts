import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
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

  @property({ visible: function (this: CancelAttack) { if (this.addAttackOppurtunity) { return true } } })
  howMuchToAdd: number = 1;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    cc.log(`do effect cancel attack`)
    const player: Player = TurnsManager.currentTurn.getTurnPlayer();
    cc.log(`player who attacks ${player.name}`)
    await BattleManager.cancelAttack(true);
    cc.log(`1`)
    if (this.addAttackOppurtunity) { TurnsManager.currentTurn.attackPlays = TurnsManager.currentTurn.attackPlays + this.howMuchToAdd }
    cc.log(`2`)
    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
