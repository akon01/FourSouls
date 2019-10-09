import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import DataCollector from "../DataCollector/DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerDeclareAttack extends Condition {

  event = PASSIVE_EVENTS.PLAYER_DECLARE_ATTACK

  @property({ type: DataCollector, tooltip: 'Only Put If Not In "Add Passive Effect" Active effect' })
  dataCollector: DataCollector = null


  conditionData: ActiveEffectData = null;

  async testCondition(meta: PassiveMeta) {

    cc.log(this.conditionData)

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
          player.playerId == selectedPlayer.playerId
          // &&
          //    meta.passiveEvent == PASSIVE_EVENTS.PLAYER_DECLARE_ATTACK
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
