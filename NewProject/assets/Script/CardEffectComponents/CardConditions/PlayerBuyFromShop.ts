import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import { PassiveMeta } from "../../Managers/PassiveManager";
import Condition from "./Condition";
import PlayerManager from "../../Managers/PlayerManager";
import Store from "../../Entites/GameEntities/Store";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerBuyFromShop extends Condition {


  conditionData: ActiveEffectData = null;

  async testCondition(meta: PassiveMeta) {

    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
    //   let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name; 
    let selectedPlayerCard = this.conditionData.getTarget(TARGETTYPE.PLAYER)
    if (selectedPlayerCard == null) {
      cc.log('no selected player')
    } else {
      if (selectedPlayerCard instanceof cc.Node) {
        let selectedPlayer = PlayerManager.getPlayerByCard(selectedPlayerCard)
        if (
          player instanceof Player &&
          player.playerId == selectedPlayer.playerId &&
          meta.passiveEvent == PASSIVE_EVENTS.PLAYER_BUY_ITEM &&
          Store.storeCards.includes(meta.args[1])
        ) {
          return true;
        } else {
          return false;
        }
      }
    }
    cc.log(selectedPlayerCard)

  }
}
