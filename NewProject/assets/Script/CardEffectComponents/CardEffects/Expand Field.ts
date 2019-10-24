import Player from "../../Entites/GameEntities/Player";
import MonsterField from "../../Entites/MonsterField";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import TurnsManager from "../../Managers/TurnsManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import Store from "../../Entites/GameEntities/Store";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExpandMonsters extends Effect {
  effectName = "ExpandMonsters";

  @property({ type: cc.Enum({ Monster: 1, Shop: 2 }) })
  fieldType = 1


  @property(cc.Integer)
  howMuchToAdd: number = 1;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    let player: Player = TurnsManager.currentTurn.getTurnPlayer();
    if (this.fieldType == 1) {
      MonsterField.addMonsterToNewPlace(true)
    } else {
      Store.maxNumOfItems += this.howMuchToAdd
    }
    // await BattleManager.cancelAttack(true);
    // if (this.addAttackOppurtunity) TurnsManager.currentTurn.attackPlays = TurnsManager.currentTurn.attackPlays + this.howMuchToAdd


    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
