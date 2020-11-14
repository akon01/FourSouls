import { Card } from "../../../Server/src/entities/Card";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import IdAndName from "../CardEffectComponents/IdAndNameComponent";
import { TARGETTYPE } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import Stack from "../Entites/Stack";
import { PassiveEffectData } from "../Managers/DataInterpreter";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import SteamySaleEffect from "./Steamy Sale Effect";

const { ccclass, property } = cc._decorator;

@ccclass('SteamySaleEffect2')
export default class SteamySaleEffect2 extends Effect {
  effectName = "SteamySaleEffect2";

  @property(SteamySaleEffect)
  steamySaleEffect1: SteamySaleEffect = null


  @property(IdAndName)
  steamySaleEffect1Id: IdAndName = new IdAndName()


  getSteamySaleEffect1() {
    return this.node.getComponent(CardEffect).getEffect(this.steamySaleEffect1Id.id) as SteamySaleEffect
  }

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
    player.storeCardCostReduction = this.getSteamySaleEffect1().originalStoreCost

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }


}
