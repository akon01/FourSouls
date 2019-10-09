import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import { PassiveMeta } from "../../Managers/PassiveManager";
import Condition from "./Condition";
import PlayerManager from "../../Managers/PlayerManager";
import Store from "../../Entites/GameEntities/Store";
import DataCollector from "../DataCollector/DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerBuyFromShop extends Condition {

  event = PASSIVE_EVENTS.PLAYER_BUY_ITEM

  conditionData: ActiveEffectData = null;

  @property
  isSpecificPlayerOnly: boolean = true;

  @property({
    type: DataCollector, visible: function (this: PlayerBuyFromShop) {
      if (this.isSpecificPlayerOnly) return true
    }, tooltip: 'Only Put If Not In "Add Passive Effect" Active effect'
  })
  dataCollector: DataCollector = null

  async testCondition(meta: PassiveMeta) {

    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
    //   let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name; 
    if (this.isSpecificPlayerOnly) {
      let selectedPlayerCard = this.conditionData.getTarget(TARGETTYPE.PLAYER)
      if (selectedPlayerCard == null) {
        cc.log('no selected player')
      } else {
        if (selectedPlayerCard instanceof cc.Node) {
          let selectedPlayer = PlayerManager.getPlayerByCard(selectedPlayerCard)
          if (
            player instanceof Player &&
            player.playerId == selectedPlayer.playerId &&
            // meta.passiveEvent == PASSIVE_EVENTS.PLAYER_BUY_ITEM &&
            Store.storeCards.includes(meta.args[1])
          ) {
            return true;
          } else {
            return false;
          }
        }
      }
    } else {
      if (player instanceof Player && Store.storeCards.includes(meta.args[1])) {
        return true
      } else return false
    }
  }
}
