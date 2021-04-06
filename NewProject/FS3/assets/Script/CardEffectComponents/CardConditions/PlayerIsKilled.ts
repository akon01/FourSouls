import { Node, _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
import { CheckEggCounterConditionProp } from './ConditionsProperties/CheckEggCounterConditionProp';
const { ccclass, property } = _decorator;


@ccclass('PlayerIsKilledCondition')
export class PlayerIsKilledCondition extends Condition {
  event = PASSIVE_EVENTS.PLAYER_IS_KILLED
  @property
  isSpecificPlayer = false;
  @property({
    type: Node,
    visible: function (this: PlayerIsKilledCondition) {
      return this.isSpecificPlayer
    }
  })
  specificPlayer: Node | null = null

  @property({ visible: function (this: PlayerIsKilledCondition) { return !this.isOnlyCardOwner } })
  isNotCardOwner = false;

  @property({ visible: function (this: PlayerIsKilledCondition) { return !this.isNotCardOwner } })
  isOnlyCardOwner = false;


  @property(CheckEggCounterConditionProp)
  checkEggCoutner: CheckEggCounterConditionProp = new CheckEggCounterConditionProp()

  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }

    const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(meta.methodScope)!
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    const cardOwner = WrapperProvider.cardManagerWrapper.out.getCardOwner(thisCard)!
    let answer = true
    // const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard);
    if (!(player instanceof Player)) {
      answer = false;
    }
    if (this.isSpecificPlayer) {
      if (player.node != this.specificPlayer) {
        answer = false;
      }
    }
    if (this.isNotCardOwner) {
      if (player.character == cardOwner) {
        answer = false;
      }
    }
    if (this.isOnlyCardOwner) {
      if (player.character != cardOwner) {
        answer = false;
      }
    }
    if (this.checkEggCoutner.checkIfMonsterHasEggCoutners) {
      answer = this.checkEggCoutner.checkEntity(player, answer)
    }
    return answer
  }
}
