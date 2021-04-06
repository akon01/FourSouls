import { CCInteger, Node, _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Card } from "../../Entites/GameEntities/Card";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('PlayerDrawLootCard')
export class PlayerDrawLootCard extends Condition {
  event = PASSIVE_EVENTS.PLAYER_DRAW_FROM_LOOT

  @property
  isOwnerOnly = false

  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    let answer = true
    if (!(player instanceof Player)) {
      answer = false;
    }
    if (this.isOwnerOnly) {
      if (cardOwner != player) {
        answer = false
      }
    }

    return answer
  }
}
