import { _decorator } from 'cc';
import { PlayerRollNumber } from '../CardEffectComponents/CardConditions/PlayerRollNumber';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { TARGETTYPE } from "../Constants";
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
const { ccclass, property } = _decorator;



@ccclass('CrystalBallEffect1')
export class CrystalBallEffect1 extends Effect {
  effectName = "CrystalBallEffect1";

  @property(PlayerRollNumber)
  playerRollNumberCondition: PlayerRollNumber | null = null
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {
    if (!this.playerRollNumberCondition) {
      throw new Error("No Crystal Ball effect 2");
    }
    this.playerRollNumberCondition.numberRoll = data.getTarget(TARGETTYPE.NUMBER) as number
    return stack
  }
}