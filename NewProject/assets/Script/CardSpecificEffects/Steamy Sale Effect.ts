import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { PassiveEffectData } from "../Managers/DataInterpreter";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import Store from "../Entites/GameEntities/Store";
import { TARGETTYPE } from "../Constants";
import PlayerManager from "../Managers/PlayerManager";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass('SteamySaleEffect')
export default class SteamySaleEffect extends Effect {
  effectName = "SteamySaleEffect";

  originalStoreCost: number = 0

  @property
  toReverseEffect: boolean = false;


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
    this.originalStoreCost = player.storeCardCostReduction
    player.storeCardCostReduction += 5;

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }


}
