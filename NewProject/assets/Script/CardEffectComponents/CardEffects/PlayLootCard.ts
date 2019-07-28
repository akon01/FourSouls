import { ServerEffect } from "./../../Entites/ServerCardEffect";
import { CHOOSE_TYPE } from "./../../Constants";

import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import EffectInterface from "./EffectInterface";
import Effect from "./Effect";
import DataCollector from "../DataCollector/DataCollector";
import { ActiveEffectData } from "../../Managers/DataInterpreter";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayLootCard extends Effect {
  chooseType = CHOOSE_TYPE.MYHAND;

  effectName = "playLootCard";
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: ActiveEffectData
  ) {
    cc.log(data)
    serverEffectStack.push(data.cardEffect);
    return serverEffectStack
  }
}
