import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import BattleManager from "../../Managers/BattleManager";
import { PassiveMeta } from "../../Managers/PassiveManager";
import TurnsManager from "../../Managers/TurnsManager";
import DataCollector from "../DataCollector/DataCollector";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";
import PlayerManager from "../../Managers/PlayerManager";
import Monster from "../../Entites/CardTypes/Monster";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerRollNumber extends Condition {

  event = PASSIVE_EVENTS.PLAYER_ROLL_DICE

  needsDataCollector = false

  @property
  isMultiNumber: boolean = false

  @property({
    type: [cc.Integer],
    visible: function (this: PlayerRollNumber) {
      if (this.isMultiNumber) {
        return true
      }
    }
  })
  numbers: number[] = []

  @property({
    visible: function (this: PlayerRollNumber) {
      if (!this.isMultiNumber) {
        return true
      }
    }
  })
  numberRoll: number = 1;

  @property
  isOnlyAttackingPlayer: boolean = false;

  @property({
    visible: function (this: PlayerRollNumber) {
      return this.isOnlyAttackingPlayer
    }
  })
  isSpecificMonsterAttacked: boolean = false;

  @property({
    visible: function (this: PlayerRollNumber) {
      return this.isOnlyAttackingPlayer && this.isSpecificMonsterAttacked
    }, type: Monster
  })
  specificMonsterAttacked: Monster = null;

  @property
  isOwnerOnly: boolean = false;

  // cardChosenId: number;
  // playerId: number;
  conditionData = null;

  // @property({ type: DataCollector, tooltip: 'Only Put If Not In "Add Passive Effect" Active effect' })
  // dataCollector: DataCollector = null

  async testCondition(meta: PassiveMeta) {

    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node)
    const numberRolled = meta.args[0]
    let answer = false;
    cc.log(`player ${player.name} rolled ${numberRolled}, this numberRoll is ${this.numberRoll}`)
    //  let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name;
    if (
      player instanceof Player

    ) {

      if (this.isMultiNumber) {
        this.numbers.forEach(number => {
          if (number == numberRolled) {
            answer = true
          }
        })
      } else if (this.numberRoll == numberRolled) {
        answer = true
      }
    }
    if (this.isOnlyAttackingPlayer) {
      if (!(BattleManager.currentlyAttackedMonsterNode != null && player == TurnsManager.currentTurn.getTurnPlayer())) {
        answer = false;
      } else {
        if (this.isSpecificMonsterAttacked) {
          if (this.specificMonsterAttacked != BattleManager.currentlyAttackedMonster) {
            answer = false;
          }
        }
      }
    }
    if (this.isOwnerOnly) {
      if (PlayerManager.getPlayerByCard(thisCard) != player) {
        answer = false;
      }
    }
    cc.log(`answer is ${answer}`)
    return answer
  }
}
