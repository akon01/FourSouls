import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import ChooseCard from "../DataCollector/ChooseCard";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
import ChooseCardTypeAndFilter from "../ChooseCardTypeAndFilter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StealItemFromPlayer extends Effect {

  effectName = "StealItemFromPlayer";

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {


    const playerToGiveTo: Player =PlayerManager.getPlayerByCard((data.getTarget(TARGETTYPE.PLAYER) as cc.Node))
    if (playerToGiveTo == null) {
      throw new Error(`player is null`)
    } else {
     const cardToTake = data.getTarget(TARGETTYPE.ITEM) as cc.Node;
      //p1 choose which loot to get.
     const playerToTakeFrom = PlayerManager.getPlayerByCard(cardToTake)
      await playerToTakeFrom.loseItem(cardToTake, true)
      await playerToGiveTo.addItem(cardToTake, true, true)
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
