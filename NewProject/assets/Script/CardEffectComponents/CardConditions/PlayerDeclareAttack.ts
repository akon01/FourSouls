import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import DataCollector from "../DataCollector/DataCollector";
import Card from "../../Entites/GameEntities/Card";
import Monster from "../../Entites/CardTypes/Monster";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerDeclareAttack extends Condition {

  event = PASSIVE_EVENTS.PLAYER_DECLARE_ATTACK

  @property
  isPlayerFromData: boolean = true

  @property
  isOnSpecificMonster: boolean = false

  @property({
    visible: function (this: PlayerDeclareAttack) {
      return this.isOnSpecificMonster
    }, type: Monster
  })
  specificMonster: Monster = null

  conditionData: ActiveEffectData = null;

  async testCondition(meta: PassiveMeta) {

    let player: Player = meta.methodScope.getComponent(Player);
    const attackedMonster = meta.args[0] as cc.Node
    const thisCard = Card.getCardNodeByChild(this.node)
    //   let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name; 
    let selectedPlayerCard = this.conditionData.getTarget(TARGETTYPE.PLAYER)
    var answer = true
    if (this.isPlayerFromData) {
      if (selectedPlayerCard == null) {
        throw new Error("no selected Player when needed")
      } else {
        if (selectedPlayerCard instanceof cc.Node) {
          let selectedPlayer = PlayerManager.getPlayerByCard(selectedPlayerCard)
          if (
            player.playerId != selectedPlayer.playerId
          ) {
            answer = false
          }

        }
      }
    }
    if (!(player instanceof Player)) {
      answer = false
    }
    if (this.isOnSpecificMonster) {
      if (this.specificMonster = attackedMonster.getComponent(Monster)) {
        answer = false
      }
    }

    return answer
  }
}
