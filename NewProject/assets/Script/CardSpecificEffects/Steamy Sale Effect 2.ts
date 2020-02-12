import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { PassiveEffectData } from "../Managers/DataInterpreter";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import Store from "../Entites/GameEntities/Store";
import { TARGETTYPE } from "../Constants";
import PlayerManager from "../Managers/PlayerManager";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import SteamySaleEffect from "./Steamy Sale Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SteamySaleEffect2 extends Effect {
  effectName = "SteamySaleEffect2";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  @property(SteamySaleEffect)
  steamySaleEffect1: SteamySaleEffect = null


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData
  ) {
    const playerCard = data.getTarget(TARGETTYPE.PLAYER) as cc.Node
    if (!playerCard) {
      throw new Error(`No Player Found To Reduce Store Cost`)
    }
    const player = PlayerManager.getPlayerByCard(playerCard)
    player.storeCardCostReduction = this.steamySaleEffect1.originalStoreCost

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }


}
