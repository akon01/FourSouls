import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Stack } from "../Entites/Stack";
import { BattleManager } from "../Managers/BattleManager";
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { PlayerManager } from "../Managers/PlayerManager";
import { TurnsManager } from "../Managers/TurnsManager";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { Effect } from "./CardEffects/Effect";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('RollOnMonster')
export class RollOnMonster extends Effect {
  effectName = "RollOnMonster";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    let numberRolled = (data as ActiveEffectData).numberRolled;
    let turnPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerById(WrapperProvider.turnsManagerWrapper.out.currentTurn!.PlayerId)!
    let playerHitMonster = await WrapperProvider.battleManagerWrapper.out.rollOnMonster(numberRolled, true);
    if (playerHitMonster == true) {
      let damage = turnPlayer.calculateDamage();
      await WrapperProvider.battleManagerWrapper.out.currentlyAttackedMonster!.takeDamaged(damage, true, turnPlayer.character!);
    } else {
      let damage = WrapperProvider.battleManagerWrapper.out.currentlyAttackedMonster!.calculateDamage();
      let o = await turnPlayer.takeDamage(damage, true, WrapperProvider.battleManagerWrapper.out.currentlyAttackedMonster!.node);
    }
    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }
}