import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { COLLECTORTYPE } from "../../Constants";
import { PlayerManager } from "../../Managers/PlayerManager";
import { DataCollector } from "./DataCollector";
import { EffectTarget } from "../../Managers/EffectTarget";
import { CardManager } from "../../Managers/CardManager";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('CardOwner')
export class CardOwner extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "CardOwner";
  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data: any) {
    const card = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const playerComp = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(card)
    let player: Node | null
    if (playerComp) {
      player = playerComp.character!
    } else {
      player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(WrapperProvider.cardManagerWrapper.out.getCardOwner(card)!)!.character!
    }
    const target = new EffectTarget(player)
    // let data2 = { cardOwner: player.playerId };
    return target;
  }
}