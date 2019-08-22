import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";


const { ccclass, property } = cc._decorator;

@ccclass
export default class AddMoney extends Effect {
  effectName = "addMoney";

  @property(Number)
  numOfCoins: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData) {


    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      cc.log(`target player is null`)
    } else {
      let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard)
      await player.changeMoney(this.numOfCoins, true);
    }
    return stack
  }
}
