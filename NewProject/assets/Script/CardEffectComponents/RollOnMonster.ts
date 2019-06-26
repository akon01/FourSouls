import Effect from "./CardEffects/Effect";
import DataCollector from "./DataCollector/DataCollector";
import { ServerEffect } from "../Entites/ServerCardEffect";
import PlayerManager from "../Managers/PlayerManager";
import Player from "../Entites/GameEntities/Player";
import BattleManager from "../Managers/BattleManager";
import TurnsManager from "../Managers/TurnsManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RollOnMonster extends Effect {
  effectName = "RollOnMonster";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(
    serverEffectStack: ServerEffect[],
    data?: { numberRolled: number; cardPlayerId: number }
  ) {
    let numberRolled = data;
    let sendToServer;
    if (
      PlayerManager.mePlayer.getComponent(Player).playerId ==
      TurnsManager.currentTurn.PlayerId
    ) {
      sendToServer = true;
    } else {
      sendToServer = false;
    }
    BattleManager.rollOnMonster(data.numberRolled, sendToServer);

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
