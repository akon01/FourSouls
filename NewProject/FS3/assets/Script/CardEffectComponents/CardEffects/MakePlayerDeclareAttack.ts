import { Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('MakePlayerDeclareAttack')
export class MakePlayerDeclareAttack extends Effect {
  effectName = "AddAttackOpportunity";
  @property
  makeSpecificMonsterMust = false;
  @property({
    visible: function (this: MakePlayerDeclareAttack) {
      return (this.makeSpecificMonsterMust)
    }
    , type: Monster
  })
  specificMonsterToDeclareAttackOn: Monster | null = null
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data"); }
    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      throw new CardEffectTargetError(`No Target Player Found`, true, data, stack)
    } else {
      const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard as Node)!
      if (this.makeSpecificMonsterMust) {
        if (!this.specificMonsterToDeclareAttackOn) { debugger; throw new Error("No Specific Monster Set"); }

        await player.declareAttack(this.specificMonsterToDeclareAttackOn.node, true)
      } else {
        const monsterTarget = data.getTarget(TARGETTYPE.MONSTER) as Node | null;
        if (!monsterTarget) {
          throw new CardEffectTargetError(`No Monster To Declare Attack On Found`, true, data, stack)
        }
        await player.declareAttack(monsterTarget, true)
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}