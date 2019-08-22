import Character from "../../Entites/CardTypes/Character";
import Monster from "../../Entites/CardTypes/Monster";
import BattleManager from "../../Managers/BattleManager";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KillEntity extends Effect {

  effectName = "KillEntity";


  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {
    let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
    if (targetEntity == null) { targetEntity = data.getTarget(TARGETTYPE.MONSTER) }

    if (targetEntity == null) {
      cc.log('no target entity to kill')
    } else {
      let entityComp;
      entityComp = targetEntity.getComponent(Character);
      if (entityComp == null) {
        entityComp = targetEntity.getComponent(Monster)
        await BattleManager.killMonster(targetEntity, true)
      } else {
        if (entityComp instanceof Character) {
          await PlayerManager.getPlayerByCard(entityComp.node).killPlayer(true)
        }
      }
    }
    return stack
  }
}
