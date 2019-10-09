import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import TurnsManager from "../../Managers/TurnsManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";


const { ccclass, property } = cc._decorator;

@ccclass
export default class AddBuyOpportunity extends Effect {
  effectName = "AddBuyOpportunity";

  @property(Number)
  numOfTimes: number = 0;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {


    // let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    // if (targetPlayerCard == null) {
    //   cc.log(`target player is null`)
    //    } else {
    //  let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard as cc.Node)
    TurnsManager.currentTurn.buyPlays += this.numOfTimes
    //  }
    if (data instanceof PassiveEffectData) return data
    return stack
  }

}
