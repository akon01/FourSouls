import Character from "../../Entites/CardTypes/Character";
import Monster from "../../Entites/CardTypes/Monster";
import BattleManager from "../../Managers/BattleManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import CardManager from "../../Managers/CardManager";
import Stack from "../../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HealEntity extends Effect {

  effectName = "HealEntity";

  @property(cc.Integer)
  hpToHeal: number = 1

  @property
  isMultiTarget: boolean = false;


  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {

    if (this.isMultiTarget) {
      let targetEntities = data.getTargets(TARGETTYPE.PLAYER)
      if (targetEntities == null) { targetEntities = data.getTargets(TARGETTYPE.MONSTER) }

      if (targetEntities == null) {
        cc.log('no target entities to kill')
      } else {
        for (const entity of targetEntities) {
          this.healEntity(entity as cc.Node)
        }
      }
    } else {
      let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
      if (targetEntity == null) { targetEntity = data.getTarget(TARGETTYPE.MONSTER) }

      if (targetEntity == null) {
        cc.log('no target entity to kill')
      } else {
        this.healEntity(targetEntity as cc.Node)
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }

  healEntity(entity: cc.Node) {
    let entityComp;
    entityComp = entity.getComponent(Character);
    if (entityComp == null) {
      entity.getComponent(Monster).heal(this.hpToHeal, true)
    } else {
      if (entityComp instanceof Character) {
        PlayerManager.getPlayerByCard(entityComp.node).heal(this.hpToHeal, true)
      }
    }
  }
}
