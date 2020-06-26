import Character from "../../Entites/CardTypes/Character";
import Monster from "../../Entites/CardTypes/Monster";
import Stack from "../../Entites/Stack";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DealDamage extends Effect {

  effectName = "DealDamage";

  @property(cc.Integer)
  damageToDeal: number = 0;

  @property
  multipleTargets: boolean = false;

  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {

    if (this.multipleTargets) {
      let targets = data.getTargets(TARGETTYPE.PLAYER)
      if (targets.length == 0) { targets = data.getTargets(TARGETTYPE.MONSTER) }
      if (targets.length == 0) {
        throw new Error(`no targets`)
      }

      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];

        await this.hitAnEntity(target as cc.Node)

      }

    } else {
      let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
      if (targetEntity == null) { targetEntity = data.getTarget(TARGETTYPE.MONSTER); }
      if (targetEntity == null) {
        cc.log(`target is null`)
        return
      }

      await this.hitAnEntity(targetEntity as cc.Node)
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }

  async hitAnEntity(targetEntity: cc.Node) {
    let entityComp;
    const thisCard = Card.getCardNodeByChild(this.node)
    const damageDealer = CardManager.getCardOwner(thisCard)
    entityComp = targetEntity.getComponent(Character);
    //Entity is Monster
    if (entityComp == null) {
      entityComp = targetEntity.getComponent(Monster)
      if (entityComp instanceof Monster) {
        await entityComp.takeDamaged(this.damageToDeal, true, damageDealer)
      }
    } else {
      //Entity is Player
      if (entityComp instanceof Character) {

        await PlayerManager.getPlayerByCard(entityComp.node).takeDamage(this.damageToDeal, true, damageDealer)
      }
    }
  }
}
