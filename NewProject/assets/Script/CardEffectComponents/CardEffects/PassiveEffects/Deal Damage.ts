import StackEffectInterface from "../../../StackEffects/StackEffectInterface";

import Effect from "../Effect";
import DataCollector from "../../DataCollector/DataCollector";
import { PassiveEffectData } from "../../../Managers/DataInterpreter";
import { TARGETTYPE } from "../../../Constants";
import Player from "../../../Entites/GameEntities/Player";
import Monster from "../../../Entites/CardTypes/Monster";
import PlayerManager from "../../../Managers/PlayerManager";
import CardManager from "../../../Managers/CardManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class DealDamage extends Effect {
  effectName = "DealDamage";

  @property({ type: DataCollector, override: true })
  dataCollector = null;


  @property
  damageToDeal: number = 1;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    let entityToHit = data.getTarget(TARGETTYPE.PLAYER)
    let isPlayer = true;
    if (entityToHit == null) {
      isPlayer = false;
      entityToHit = data.getTarget(TARGETTYPE.MONSTER)
    }
    if (isPlayer) {
      let owner = CardManager.getCardOwner(this.node.parent)
      await PlayerManager.getPlayerByCard(entityToHit as cc.Node).takeDamage(this.damageToDeal, true, owner)
    } else {
      await (entityToHit as cc.Node).getComponent(Monster).takeDamaged(this.damageToDeal, true)
    }

    return data
  }
}
