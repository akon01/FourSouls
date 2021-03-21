import { log, _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Player } from "../../Entites/GameEntities/Player";
import { Stack } from "../../Entites/Stack";
import { BattleManager } from "../../Managers/BattleManager";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { TurnsManager } from "../../Managers/TurnsManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('CancelAttack')
export class CancelAttack extends Effect {
  effectName = "CancelAttack";
  @property
  addAttackOppurtunity: boolean = false;
  @property({ visible: function (this: CancelAttack) { return this.addAttackOppurtunity } })
  howMuchToAdd: number = 1;
  noDataCollector = true
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    log(`do effect cancel attack`)
    const player: Player = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!;
    log(`player who attacks ${player.name}`)
    await WrapperProvider.battleManagerWrapper.out.cancelAttack(true);
    if (this.addAttackOppurtunity) {
      player.attackPlays += this.howMuchToAdd
    }

    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}