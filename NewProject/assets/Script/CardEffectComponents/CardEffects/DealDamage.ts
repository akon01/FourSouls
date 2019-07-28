import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE, TARGETTYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import { override } from "kaop";
import CardManager from "../../Managers/CardManager";
import Monster from "../../Entites/CardTypes/Monster";
import BattleManager from "../../Managers/BattleManager";
import Character from "../../Entites/CardTypes/Character";
import { ActiveEffectData } from "../../Managers/NewScript";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DealDamage extends Effect {

  effectName = "DealDamage";

  @property(cc.Integer)
  damageToDeal: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: ActiveEffectData
  ) {

    let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
    if (targetEntity == null) targetEntity = data.getTarget(TARGETTYPE.MONSTER);

    let entityComp;
    entityComp = targetEntity.getComponent(Character);
    //Entity is Monster
    if (entityComp == null) {
      entityComp = targetEntity.getComponent(Monster)
      if (entityComp instanceof Monster) {
        await entityComp.getDamaged(this.damageToDeal, true)
      }
    } else {
      //Entity is Player
      if (entityComp instanceof Character) {
        await PlayerManager.getPlayerByCard(entityComp.node).getHit(this.damageToDeal, true)
      }
    }


    return serverEffectStack
  }
}
