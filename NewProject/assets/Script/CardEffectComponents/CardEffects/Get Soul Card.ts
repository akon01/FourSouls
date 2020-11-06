import Stack from "../../Entites/Stack";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GetSoulCard extends Effect {

  effectName = "GetSoulCard";

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
   const playerCard= data.getTarget(TARGETTYPE.PLAYER)
    const cardToTake = data.getTarget(TARGETTYPE.CARD)

    const playerToGiveTo = PlayerManager.getPlayerByCard(playerCard as cc.Node)
    if (playerToGiveTo == null) {
      throw new Error(`player to give to is null`)
    } else {
      await playerToGiveTo.getSoulCard(cardToTake as cc.Node, true)
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
