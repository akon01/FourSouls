import { Node, _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('PlayerChooseItemToDestroyForPenalties')
export class PlayerChooseItemToDestroyForPenalties extends Condition {
  events = [PASSIVE_EVENTS.PLAYER_CHOOSE_ITEM_TO_DESTROY_FOR_PANELTIES]

  @property({ visible: function (this: PlayerChooseItemToDestroyForPenalties) { return !this.isNotOwnerOnly } })
  isOwnerOnly = false

  @property({ visible: function (this: PlayerChooseItemToDestroyForPenalties) { return !this.isOwnerOnly } })
  isNotOwnerOnly = false

  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Scope!"); }

    const player = meta.methodScope.getComponent(Player)!;

    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)!
    const playerOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!
    let cardOwner: Node | null = null;
    if (playerOwner) {
      cardOwner = playerOwner.node
    } else {
      cardOwner = thisCard;
    }
    let answer = true
    if (this.isOwnerOnly) {
      answer = cardOwner == player.node
    }
    if (this.isNotOwnerOnly) {
      answer = cardOwner != player.node
    }

    if (!this.events.includes(meta.passiveEvent!)) {
      answer = false
    }
    return answer
  }
}