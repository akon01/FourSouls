import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import { override } from "kaop";
import CardManager from "../../Managers/CardManager";
import Monster from "../../Entites/CardTypes/Monster";
import BattleManager from "../../Managers/BattleManager";
import Character from "../../Entites/CardTypes/Character";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KillEntity extends Effect {

  effectName = "KillEntity";

  @property({
    type: DataCollector,
    override: true
  })
  dataCollector: DataCollector = null;

  /**
   *
   * @param data {target:PlayerId}
   */

  doEffect(
    serverEffectStack: ServerEffect[],
    data?: { cardChosenId: number; playerId: number }
  ) {
    // let stealer = PlayerManager.getPlayerById(data.playerId).getComponent(
    //   Player
    // );
    cc.log(data.cardChosenId)
    let targetEntity = CardManager.getCardById(
      data.cardChosenId, true
    );
    cc.log(targetEntity)
    let entityComp;
    entityComp = targetEntity.getComponent(Character);
    if (entityComp == null) {
      cc.log('kill monster')
      entityComp = targetEntity.getComponent(Monster)
      BattleManager.killMonster(targetEntity, true)
    } else {
      cc.log('dont kill monster')
      if (entityComp instanceof Character) {
        cc.log('kill player')
        PlayerManager.getPlayerByCard(entityComp.node).killPlayer(true)
      }
    }
    // if (targetPlayer.coins >= this.numOfCoins) {
    //   targetPlayer.changeMoney(-this.numOfCoins, false);
    //   stealer.changeMoney(this.numOfCoins, false);
    // } else {
    //   stealer.changeMoney(targetPlayer.coins, false);
    //   targetPlayer.changeMoney(-targetPlayer.coins, false);
    // }

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
