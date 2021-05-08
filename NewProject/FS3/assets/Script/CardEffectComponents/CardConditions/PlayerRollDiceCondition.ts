import { Enum, _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS, ROLL_TYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('PlayerRollDiceCondition')
export class PlayerRollDiceCondition extends Condition {
  event = PASSIVE_EVENTS.PLAYER_ROLL_DICE
  needsDataCollector = false;

  @property
  isCardOwnerOnly = true

  @property
  checkRollType = true

  @property({
    type: Enum(ROLL_TYPE), visible: function (this: PlayerRollDiceCondition) {
      return this.checkRollType
    }
  })
  rollTypeToCheck: ROLL_TYPE = ROLL_TYPE.FIRST_ATTACK

  @property
  checkIsFirstAttackOfTurn = true

  @property
  checkIsFirstRollOfTurn = false

  testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    let answer = true
    const player: Player = meta.methodScope.getComponent(Player)!;
    if (this.checkRollType) {
      if (this.rollTypeToCheck != meta.args[1]) {
        answer = false
      }
    }
    if (!player) {
      answer = false
    }
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    if (this.isCardOwnerOnly) {
      if (player.name !== cardOwner.name) {
        answer = false
      }
    }
    if (this.checkIsFirstAttackOfTurn) {
      if (!player._isFirstAttackRollOfTurn) {
        answer = false
      }
    }
    if (this.checkIsFirstRollOfTurn) {
      if (!player._isFirstRollOfTurn) {
        answer = false
      }
    }
    return Promise.resolve(answer);
  }
}
