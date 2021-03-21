import { Node, _decorator } from 'cc';
import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('PlayerBuyFromShop')
export class PlayerBuyFromShop extends Condition {
  event = PASSIVE_EVENTS.PLAYER_BUY_ITEM
  @property
  isSpecificPlayerOnly: boolean = true;
  @property
  needsDataCollector: boolean = true;


  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    // let playerName = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(this.conditionData.cardChosenId).name;
    if (this.isSpecificPlayerOnly) {
      const selectedPlayerCard = this.conditionData.getTarget(TARGETTYPE.PLAYER)!
      if (selectedPlayerCard == null) {
      } else {
        if (selectedPlayerCard instanceof Node) {
          const selectedPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(selectedPlayerCard)!
          if (!meta.args) { debugger; throw new Error("No Args"); }
          if (
            player instanceof Player &&
            player.playerId == selectedPlayer.playerId &&
            new Set(WrapperProvider.storeWrapper.out.getStoreCards().concat(WrapperProvider.storeWrapper.out.thisTurnStoreCards)).has(meta.args[1])
          ) {
            return true;
          } else {
            return false;
          }
        }
      }
    } else {
      if (!meta.args) { debugger; throw new Error("No Args"); }
      if (player instanceof Player && new Set(WrapperProvider.storeWrapper.out.getStoreCards().concat(WrapperProvider.storeWrapper.out.thisTurnStoreCards)).has(meta.args[1])) {
        return true
      } else {
        return false
      }
    }
    return false
  }
}
