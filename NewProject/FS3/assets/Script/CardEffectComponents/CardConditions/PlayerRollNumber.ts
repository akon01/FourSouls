import { CCInteger, log, _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('PlayerRollNumber')
export class PlayerRollNumber extends Condition {
  event = PASSIVE_EVENTS.PLAYER_ROLL_DICE
  needsDataCollector = false
  @property
  isMultiNumber = false
  @property({
    type: [CCInteger],
    visible: function (this: PlayerRollNumber) {
      return this.isMultiNumber
    }
  })
  numbers: number[] = []
  @property({
    visible: function (this: PlayerRollNumber) {
      return !this.isMultiNumber
    }
  })
  numberRoll = 1;
  @property
  isOnlyAttackingPlayer = false;
  @property({
    visible: function (this: PlayerRollNumber) {
      return this.isOnlyAttackingPlayer
    }
  })
  isSpecificMonsterAttacked = false;
  @property({
    visible: function (this: PlayerRollNumber) {
      return this.isOnlyAttackingPlayer && this.isSpecificMonsterAttacked
    }, type: Monster
  })
  specificMonsterAttacked: Monster | null = null;

  @property
  isOwnerOnly = false;


  // @property({ type: DataCollector, tooltip: 'Only Put If Not In "Add Passive Effect" Active effect' })
  // dataCollector: DataCollector = null

  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const numberRolled = meta.args[0]
    let answer = false;
    console.log(`player ${player.name} rolled ${numberRolled}, this numberRoll is ${this.numberRoll}`)
    // let playerName = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(this.conditionData.cardChosenId).name;
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
      if (!(WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntityNode != null && player == WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer())) {
        answer = false;
      } else {
        if (this.isSpecificMonsterAttacked) {
          if (this.specificMonsterAttacked?.node != WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity?.node) {
            answer = false;
          }
        }
      }
    }
    if (this.isOwnerOnly) {
      if (WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard) != player) {
        answer = false;
      }
    }
    console.log(`answer is ${answer}`)
    return answer
  }
}
