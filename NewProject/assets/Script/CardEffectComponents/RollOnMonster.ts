import Stack from "../Entites/Stack";
import BattleManager from "../Managers/BattleManager";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import Effect from "./CardEffects/Effect";


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
    data?: ActiveEffectData | PassiveEffectData
  ) {
    let numberRolled = (data as ActiveEffectData).numberRolled;
    let turnPlayer = PlayerManager.getPlayerById(
      TurnsManager.currentTurn.PlayerId
    )
    let playerHitMonster = await BattleManager.rollOnMonster(numberRolled, true);
    if (playerHitMonster == true) {
      let damage = turnPlayer.calculateDamage();
      // 
      // 
      await BattleManager.currentlyAttackedMonster.takeDamaged(damage, true, turnPlayer.character);
      // 
    } else {
      let damage = BattleManager.currentlyAttackedMonster.calculateDamage();
      // 
      // 


      let o = await turnPlayer.takeDamage(damage, true, BattleManager.currentlyAttackedMonster.node);

      // 
    }



    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
