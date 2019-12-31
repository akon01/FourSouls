import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import BattleManager from "../../Managers/BattleManager";
import { PassiveMeta } from "../../Managers/PassiveManager";
import TurnsManager from "../../Managers/TurnsManager";
import DataCollector from "../DataCollector/DataCollector";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerRollNumber extends Condition {

  event = PASSIVE_EVENTS.PLAYER_ROLL_DICE

  @property
  numberRoll: number = 1;

  @property
  isOnlyAttackingPlayer: boolean = false;

  // cardChosenId: number;
  // playerId: number;
  conditionData = null;

  // @property({ type: DataCollector, tooltip: 'Only Put If Not In "Add Passive Effect" Active effect' })
  // dataCollector: DataCollector = null

  async testCondition(meta: PassiveMeta) {

    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = this.node.parent.parent;
    cc.log(meta)
    const c = meta.args[0]
    let answer = false;
    cc.log(`player ${player.name} rolled ${c}, this numberRoll is ${this.numberRoll}`)
    //  let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name;
    if (
      player instanceof Player &&
      this.numberRoll == c
    ) { answer = true }
    if (this.isOnlyAttackingPlayer) {
      if (!(BattleManager.currentlyAttackedMonsterNode != null && player == TurnsManager.currentTurn.getTurnPlayer())) {
        answer = false;
      }
    }
    cc.log(`answer is ${answer}`)
    return answer
  }
}
