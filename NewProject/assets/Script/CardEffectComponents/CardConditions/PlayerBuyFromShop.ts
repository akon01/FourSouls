import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import Store from "../../Entites/GameEntities/Store";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerBuyFromShop extends Condition {

  event = PASSIVE_EVENTS.PLAYER_BUY_ITEM

  conditionData: ActiveEffectData = null;

  @property()
  isSpecificPlayerOnly: boolean = true;

  @property()
  needsDataCollector: boolean = true;

  async testCondition(meta: PassiveMeta) {

    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node)
    //   let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name;
    if (this.isSpecificPlayerOnly) {
      const selectedPlayerCard = this.conditionData.getTarget(TARGETTYPE.PLAYER)
      if (selectedPlayerCard == null) {
        cc.log("no selected player")
      } else {
        if (selectedPlayerCard instanceof cc.Node) {
          const selectedPlayer = PlayerManager.getPlayerByCard(selectedPlayerCard)
          if (
            player instanceof Player &&
            player.playerId == selectedPlayer.playerId &&
            new Set(Store.getStoreCards().concat(Store.thisTurnStoreCards)).has(meta.args[1])
          ) {
            return true;
          } else {
            return false;
          }
        }
      }
    } else {
      if (player instanceof Player && new Set(Store.getStoreCards().concat(Store.thisTurnStoreCards)).has(meta.args[1])) {
        return true
      } else {
        return false
      }
    }
  }
}
