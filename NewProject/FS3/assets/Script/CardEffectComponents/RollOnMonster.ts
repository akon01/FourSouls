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
  doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {
    const numberRolled = (data as ActiveEffectData).numberRolled;
    const turnPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerById(WrapperProvider.turnsManagerWrapper.out.currentTurn!.PlayerId)!
    return WrapperProvider.battleManagerWrapper.out.rollOnMonster(numberRolled, true).then(playerHitMonster => {
      if (playerHitMonster == true) {
        const damage = turnPlayer.calculateDamage();
        return WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity!.takeDamage(damage, true, turnPlayer.character!).then(_ => {
          if (data instanceof PassiveEffectData) return data
          return WrapperProvider.stackWrapper.out._currentStack
        }, (res => {
          debugger
          if (data instanceof PassiveEffectData) return data
          return WrapperProvider.stackWrapper.out._currentStack
        }));
      } else {
        const damage = WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity!.calculateDamage();
        return turnPlayer.takeDamage(damage, true, WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity!.node).then(_ => {
          if (data instanceof PassiveEffectData) return data
          return WrapperProvider.stackWrapper.out._currentStack
        }, (res => {
          debugger
          if (data instanceof PassiveEffectData) return data
          return WrapperProvider.stackWrapper.out._currentStack
        }));
      }
    }, (res => {
      debugger
      if (data instanceof PassiveEffectData) return data
      return WrapperProvider.stackWrapper.out._currentStack
    }));
  }
}