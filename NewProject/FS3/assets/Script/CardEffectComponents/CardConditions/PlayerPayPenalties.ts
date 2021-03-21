import { CCBoolean, Node, _decorator } from 'cc';
import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from '../DataCollector/DataCollector';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('PlayerPayPenalties')
export class PlayerPayPenalties extends Condition {
  event = PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES
  @property(CCBoolean)
  isSpecificPlayer: boolean = true
  // @property({
  //   type: CCInteger, visible: function (this: PlayerPayPenalties) {
  //     return this.isSpecificPlayer
  //   }, override: true
  // })
  // dataCollectorIdFinal: number = -1
  @property({
    type: DataCollector, visible: function (this: PlayerPayPenalties) {
      return this.isSpecificPlayer
    }, override: true
  })
  dataCollector: DataCollector | null = null
  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    // let playerName = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(this.conditionData.cardChosenId).name;
    let answer = true
    if (this.isSpecificPlayer) {
      const selectedPlayerCard = this.conditionData.getTarget(TARGETTYPE.PLAYER)
      if (selectedPlayerCard == null) {
        throw new Error("no selected player")
      } else {
        if (selectedPlayerCard instanceof Node) {
          const selectedPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(selectedPlayerCard)!
          if (!(player instanceof Player) || player.playerId != selectedPlayer.playerId) {
            answer = false
          }
        }
      }
    } else {
      if (!(player instanceof Player)) {
        answer = false
      }
    }
    return answer
  }
}
