import { _decorator, Enum } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS, PLAYER_RESOURCES } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from './Condition';

@ccclass("CardOwnerEndTurnWithAmountOfResource")
export class CardOwnerEndTurnWithAmountOfResource extends Condition {
  event = PASSIVE_EVENTS.PLAYER_END_TURN
  @property
  amount = 0
  @property({ type: Enum(PLAYER_RESOURCES) })
  resource: PLAYER_RESOURCES = PLAYER_RESOURCES.MONEY;
  needsDataCollector = false;

  testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      player.playerId == WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId
    ) {
      switch (this.resource) {
        case PLAYER_RESOURCES.LOOT:
          if (cardOwner.getHandCards().length == this.amount) {
            return Promise.resolve(true);
          } else {
            return Promise.resolve(false);
          }
        case PLAYER_RESOURCES.MONEY:
          if (cardOwner.coins == this.amount) {
            return Promise.resolve(true);
          } else {
            return Promise.resolve(false);
          }
        default:
          return Promise.resolve(false);
          break;
      }
    } else {
      return Promise.resolve(false);
    }
  }
}
