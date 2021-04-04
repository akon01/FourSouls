import { CCInteger, _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
const { ccclass, property } = _decorator;


@ccclass('TrinityShieldEffect')
export class TrinityShieldEffect extends Effect {
  effectName = "TrinityShieldEffect";

  @property
  boolSetting: boolean = true
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData
  ) {
    const owner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(this.getEffectCard())!
    owner.otherPlayersCantRespondOnTurn = this.boolSetting
    return data
    //return stack
  }
}
