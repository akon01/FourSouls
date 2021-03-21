import { _decorator, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('CardOwnerMissAttack')
export class CardOwnerMissAttack extends Condition {
  event = PASSIVE_EVENTS.PLAYER_MISS_ATTACK
  @property
  isSpecificRoll: boolean = false;
  //@ts-ignore
  @property({
    visible: function (this: CardOwnerMissAttack) {
      if (this.isSpecificRoll) { return true; }
    }
    , type: CCInteger
  })
  specificNumber: number = 1;
  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard);
    if (!cardOwner) { throw new Error(`no card owner from PlayerManger.getPlayerByCard of card ${thisCard.name}`) }
    if (
      player instanceof Player &&
      player.name == cardOwner.name
      && meta.passiveEvent == PASSIVE_EVENTS.PLAYER_MISS_ATTACK
    ) {
      if (this.isSpecificRoll) {
        if (this.specificNumber == meta.args[0]) {
          return true
        } else { return false }
      } else { return true; }
    } else {
      return false;
    }
  }
}