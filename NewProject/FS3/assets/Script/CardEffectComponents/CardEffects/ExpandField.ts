import { CCInteger, Enum, _decorator } from 'cc';
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('ExpandField')
export class ExpandField extends Effect {
  effectName = "ExpandField";
  @property({ type: Enum({ Monster: 1, Shop: 2 }) })
  fieldType = 1
  @property(CCInteger)
  howMuchToAdd = 1;
  noDataCollector = true
  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    const player: Player = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!;
    if (!data) throw new Error("No Data");
    this.currData = data
    this.currStack = stack
    if (this.fieldType == 1) {
      return this.handleTarget(0, this.howMuchToAdd)

    } else {
      return WrapperProvider.storeWrapper.out.addMaxNumOfItems(this.howMuchToAdd + WrapperProvider.storeWrapper.out.maxNumOfItems, true).then(_ => {
        return this.handleReturnValues()
      })
    }
  }

  handleTarget(index: number, length: number) {
    return WrapperProvider.monsterFieldWrapper.out.addMonsterToNewPlace(true).then(_ => {
      return this.handleAfterTarget(index++, length, this.handleTarget, this)
    })
  }
}
