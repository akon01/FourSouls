import { CCInteger, Node, _decorator } from 'cc';
import { Stack } from "../../Entites/Stack";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Condition } from '../CardConditions/Condition';
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('SetConditionActiveState')
export class SetConditionActiveState extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;
  effectName = "SetConditionActiveState";


  @property(Condition)
  conditionToSet: Condition | null = null

  @property
  setBool = false
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    this.conditionToSet!.isConditionActive = this.setBool
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
