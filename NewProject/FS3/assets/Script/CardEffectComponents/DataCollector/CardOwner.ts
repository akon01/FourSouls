import { Node, _decorator } from 'cc';
import { COLLECTORTYPE } from "../../Constants";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from "./DataCollector";
const { ccclass, property } = _decorator;


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
    const target = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(player)
    // let data2 = { cardOwner: player.playerId };
    return target;
  }
}