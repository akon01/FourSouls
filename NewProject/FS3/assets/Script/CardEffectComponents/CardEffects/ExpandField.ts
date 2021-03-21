import { _decorator, Enum, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

import { Player } from "../../Entites/GameEntities/Player";
import { Store } from "../../Entites/GameEntities/Store";
import { MonsterField } from "../../Entites/MonsterField";
import { Stack } from "../../Entites/Stack";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { TurnsManager } from "../../Managers/TurnsManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";

@ccclass('ExpandField')
export class ExpandField extends Effect {
  effectName = "ExpandField";
  @property({ type: Enum({ Monster: 1, Shop: 2 }) })
  fieldType = 1
  @property(CCInteger)
  howMuchToAdd: number = 1;
  noDataCollector = true
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    const player: Player = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!;
    if (this.fieldType == 1) {
      for (let i = 0; i < this.howMuchToAdd; i++) {
        await WrapperProvider.monsterFieldWrapper.out.addMonsterToNewPlace(true)
      }
    } else {
      await WrapperProvider.storeWrapper.out.addMaxNumOfItems(this.howMuchToAdd + WrapperProvider.storeWrapper.out.maxNumOfItems, true)
    }
    // await battleManagerWrapper._bmcancelAttack(true);
    // if (this.addAttackOppurtunity) turnsManagerWrapper._tm.currentTurn.attackPlays = turnsManagerWrapper._tm.currentTurn.attackPlays + this.howMuchToAdd

    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
