import { CCInteger, Node, _decorator } from 'cc';
import { Stack } from "../../Entites/Stack";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('SetCharacterRechargeAtStartOfTurn')
export class SetCharacterRechargeAtStartOfTurn extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;
  effectName = "SetCharacterRechargeAtStartOfTurn";

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
    if (!data) { debugger; throw new Error("No Data"); }
    let playerCard = data.getTarget(TARGETTYPE.PLAYER) as Node
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!
    player.setRechargeCharacterAtStartOfTurn(this.setBool, true)
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
