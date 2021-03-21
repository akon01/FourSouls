import { _decorator } from 'cc';
import { COLLECTORTYPE } from "../../Constants";
import { CardManager } from "../../Managers/CardManager";
import { EffectTarget } from "../../Managers/EffectTarget";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from "./DataCollector";
const { ccclass, property } = _decorator;


@ccclass('CardActivated')
export class CardActivated extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "CardActivated";
  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data: any) {
    let card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true)
    let target = new EffectTarget(card);
    let data2 = { cardActivated: data.cardId };
    return target;
  }
}
