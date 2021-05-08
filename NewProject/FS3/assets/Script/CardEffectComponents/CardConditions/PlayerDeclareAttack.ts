import { Node, _decorator } from 'cc';
import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Card } from "../../Entites/GameEntities/Card";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { PlayerManager } from "../../Managers/PlayerManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('PlayerDeclareAttack')
export class PlayerDeclareAttack extends Condition {
  event = PASSIVE_EVENTS.PLAYER_DECLARE_ATTACK
  @property
  isPlayerFromData = true
  @property({
    visible: function (this: PlayerDeclareAttack) {
      return this.isPlayerFromData
    }
  })
  isNotThePlayerFromData = false
  @property
  isOnSpecificMonster = false
  @property({
    visible: function (this: PlayerDeclareAttack) {
      return this.isOnSpecificMonster
    }, type: Monster
  })
  specificMonster: Monster | null = null



  testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const player = meta.methodScope.getComponent(Player)!;
    const attackedMonster = meta.args[0] as Node
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    // let playerName = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(this.conditionData.cardChosenId).name;
    const selectedPlayerCard = this.conditionData.getTarget(TARGETTYPE.PLAYER)
    let answer = true
    if (this.isPlayerFromData) {
      if (selectedPlayerCard == null) {
        throw new Error("no selected Player when needed")
      } else {
        if (selectedPlayerCard instanceof Node) {
          const selectedPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(selectedPlayerCard)!
          if (this.isNotThePlayerFromData) {
            if (player.playerId == selectedPlayer.playerId) {
              answer = false
            }
          } else {
            if (player.playerId != selectedPlayer.playerId) {
              answer = false
            }
          }
        }
      }
    }
    if (!(player instanceof Player)) {
      answer = false
    }
    if (this.isOnSpecificMonster) {
      if (this.specificMonster == attackedMonster.getComponent(Monster)) {
        answer = false
      }
    }
    return Promise.resolve(answer);
  }
}
