import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import BattleManager from "../../Managers/BattleManager";
import { PassiveMeta } from "../../Managers/PassiveManager";
import TurnsManager from "../../Managers/TurnsManager";
import DataCollector from "../DataCollector/DataCollector";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerRollSameNumberInARow extends Condition {

  event = PASSIVE_EVENTS.PLAYER_ROLL_DICE

  @property
  isOnlyAttackingPlayer: boolean = false;

  // cardChosenId: number;
  // playerId: number;
  conditionData = null;

  // @property({ type: DataCollector, tooltip: 'Only Put If Not In "Add Passive Effect" Active effect' })
  // dataCollector: DataCollector = null

  async testCondition(meta: PassiveMeta) {

    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node)
    const numberRolledNow = meta.args[0]
    let answer = false;
    cc.log(`player ${player.name} rolled ${numberRolledNow}, last numberRoll is ${player.lastRoll}`)
    //  let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name;
    if (
      player instanceof Player
    ) {
      if (this.isOnlyAttackingPlayer) {
        if ((BattleManager.currentlyAttackedMonsterNode != null && player == TurnsManager.currentTurn.getTurnPlayer() && player.lastAttackRoll == numberRolledNow)) {
          answer = true;
        }
      } else if (player.lastRoll == numberRolledNow) {
        answer = true
      }
    }
    cc.log(`answer is ${answer}`)
    return answer
  }
}
