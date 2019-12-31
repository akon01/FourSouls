import Player from "../../Entites/GameEntities/Player";
import Store from "../../Entites/GameEntities/Store";
import MonsterField from "../../Entites/MonsterField";
import Stack from "../../Entites/Stack";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import TurnsManager from "../../Managers/TurnsManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

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

    const player: Player = TurnsManager.currentTurn.getTurnPlayer();
    if (this.fieldType == 1) {
      await MonsterField.addMonsterToNewPlace(true)
    } else {
      Store.addMaxNumOfItems(this.howMuchToAdd + Store.maxNumOfItems, true)
    }
    // await BattleManager.cancelAttack(true);
    // if (this.addAttackOppurtunity) TurnsManager.currentTurn.attackPlays = TurnsManager.currentTurn.attackPlays + this.howMuchToAdd

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
