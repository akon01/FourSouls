import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";


const { ccclass, property } = cc._decorator;

@ccclass
export default class AddMoney extends Effect {
  effectName = "addMoney";

  @property(Number)
  numOfCoins: number = 0;

  @property
  multiTarget: boolean = false;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    if (this.multiTarget) {
      let targets = data.getTargets(TARGETTYPE.PLAYER)
      if (targets.length == 0) {
        cc.log(`no targets`)
        return
      }

      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];

        await PlayerManager.getPlayerByCard(target as cc.Node).changeMoney(this.numOfCoins, true)
      }


    } else {

      let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
      if (targetPlayerCard == null) {
        cc.log(`target player is null`)
      } else {
        let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard as cc.Node)
        await player.changeMoney(this.numOfCoins, true);
      }

    }

    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
