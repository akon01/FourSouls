import { Component, _decorator } from 'cc';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;

export interface IHasSavedRoll {
  getRolledNumber(): number
}

@ccclass('UseSavedRoll')
export class UseSavedRoll extends Effect {
  effectName = "UseSavedRoll";

  @property(Component)
  componentWithRolledNumber: IHasSavedRoll | null = null


  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    console.log(data)
    if (!data) { debugger; throw new Error("No Data"); }
    if (data instanceof PassiveEffectData) {
      data.methodArgs[0] = this.componentWithRolledNumber?.getRolledNumber()!
    }

    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }
}