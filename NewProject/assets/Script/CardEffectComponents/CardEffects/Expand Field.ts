import Player from "../../Entites/GameEntities/Player";
import MonsterField from "../../Entites/MonsterField";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import TurnsManager from "../../Managers/TurnsManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import Store from "../../Entites/GameEntities/Store";
import Stack from "../../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExpandField extends Effect {
  effectName = "ExpandField";

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
      Store.addMaxNumOfItems(this.howMuchToAdd + Store.maxNumOfItems, true)
    }
    // await BattleManager.cancelAttack(true);
    // if (this.addAttackOppurtunity) TurnsManager.currentTurn.attackPlays = TurnsManager.currentTurn.attackPlays + this.howMuchToAdd



    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
