import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import { override } from "kaop";
import CardManager from "../../Managers/CardManager";
import Monster from "../../Entites/CardTypes/Monster";
import BattleManager from "../../Managers/BattleManager";
import Character from "../../Entites/CardTypes/Character";
import DataInterpreter from "../../Managers/DataInterpreter";
import CardEffect from "../../Entites/CardEffect";
import ChainCollector from "../DataCollector/ChainCollector";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ChainEffects extends Effect {

  effectName = "ChainEffects";


  @property([Effect])
  effectsToChain: Effect[] = [];

  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: {}[]
  ) {

    let effectsData = [];
    let currentStack = serverEffectStack
    let cardEffectComp = this.node.parent.getComponent(CardEffect)
    const effectData = this.node.getComponentInChildren(ChainCollector).effectsData
    for (let i = 0; i < this.effectsToChain.length; i++) {
      const effect = this.effectsToChain[i];
      await effect.doEffect(
        serverEffectStack,
        effectData
      );

      // let effectInfo = cardEffectComp.getEffectIndexAndType(effect)
      // await cardEffectComp.doEffectByNumAndType(effectInfo.index, effectInfo.type, effectData)
      // let effectData = await DataInterpreter.makeEffectData(data[i],this.node.parent,)
      // currentStack = await effect.doEffect(currentStack, effectData)
    }

    // let targetEntity = data.effectTargetCard

    // let entityComp;
    // entityComp = targetEntity.getComponent(Character);
    // if (entityComp == null) {
    //   entityComp = targetEntity.getComponent(Monster)
    //   await BattleManager.killMonster(targetEntity, true)
    // } else {
    //   if (entityComp instanceof Character) {
    //     await PlayerManager.getPlayerByCard(entityComp.node).killPlayer(true)
    //   }
    // }
    return currentStack
  }
}
