import Effect from "./CardEffects/Effect";
import DataCollector from "./DataCollector/DataCollector";
import { ServerEffect } from "../Entites/ServerCardEffect";
import PlayerManager from "../Managers/PlayerManager";
import Player from "../Entites/GameEntities/Player";
import BattleManager from "../Managers/BattleManager";
import TurnsManager from "../Managers/TurnsManager";

import StackEffectInterface from "../StackEffects/StackEffectInterface";
import { ActiveEffectData } from "../Managers/DataInterpreter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RollOnMonster extends Effect {
  effectName = "RollOnMonster";


  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {
    let numberRolled = data.numberRolled;
    let turnPlayer = PlayerManager.getPlayerById(
      TurnsManager.currentTurn.PlayerId
    ).getComponent(Player);
    let playerHitMonster = await BattleManager.rollOnMonster(numberRolled, true);
    if (playerHitMonster == true) {
      let damage = turnPlayer.calculateDamage();
      // 
      // 
      await BattleManager.currentlyAttackedMonster.getDamaged(damage, true);
      // 
    } else {
      let damage = BattleManager.currentlyAttackedMonster.calculateDamage();
      // 
      // 

      let o = await turnPlayer.getHit(damage, true);

      // 
    }


    return stack
  }
}
