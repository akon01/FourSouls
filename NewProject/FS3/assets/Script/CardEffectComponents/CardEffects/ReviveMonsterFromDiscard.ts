import { Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;



@ccclass('ReviveMonsterFromDiscard')
export class ReviveMonsterFromDiscard extends Effect {
  effectName = "ReviveMonsterFromDiscard";
  /**
   *
   * @param data {target:PlayerId}
   */
  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    console.log(data)
    if (!data) { debugger; throw new Error("No Data"); }
    const cardTarget = data.getTarget(TARGETTYPE.MONSTER) as Node
    if (cardTarget == null) {
      throw new CardEffectTargetError(`No Monster To Revive Target found`, true, data, stack)
    } else {
      const player = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
      await WrapperProvider.pileManagerWrapper.out.removeFromPile(cardTarget, true)
      await WrapperProvider.monsterFieldWrapper.out.givePlayerChoiceToCoverPlace(cardTarget.getComponent(Monster)!, player)
    }
    if (data instanceof PassiveEffectData) {
      return data;
    } else { return stack }
  }
}
