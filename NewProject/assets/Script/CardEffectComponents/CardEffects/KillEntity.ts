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
export default class KillEntity extends Effect {

  effectName = "KillEntity";


  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: ActiveEffectData
  ) {

    let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
    if (targetEntity == null) { targetEntity = data.getTarget(TARGETTYPE.MONSTER) }

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
    return serverEffectStack
  }
}
