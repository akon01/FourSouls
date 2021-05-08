import { _decorator } from 'cc';
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('CancelAttack')
export class CancelAttack extends Effect {
  effectName = "CancelAttack";
  @property
  addAttackOppurtunity = false;
  @property({ visible: function (this: CancelAttack) { return this.addAttackOppurtunity } })
  howMuchToAdd = 1;
  noDataCollector = true
  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    console.log(`do effect cancel attack`)
    const player: Player = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!;
    console.log(`player who attacks ${player.name}`)
    return WrapperProvider.battleManagerWrapper.out.cancelAttack(true).then(() => {
      if (this.addAttackOppurtunity) {
        player.attackPlays += this.howMuchToAdd
      }

      if (data instanceof PassiveEffectData) { return data }
      return WrapperProvider.stackWrapper.out._currentStack
    }, (v) => {
      debugger
      if (data instanceof PassiveEffectData) { return data }
      return WrapperProvider.stackWrapper.out._currentStack
    });

  }
}