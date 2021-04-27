import { CCInteger, Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { EffectTarget } from '../../Managers/EffectTarget';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { DataCollector } from '../DataCollector/DataCollector';
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('GainLoot')
export class GainLoot extends Effect {
  effectName = "GainLoot";

  @property
  isNumOfLootFromDataCollector= false

  @property({type:DataCollector,visible:function(this:GainLoot){
    return this.isNumOfLootFromDataCollector
  }})
  numOfLootDataCollector:DataCollector|null=null

  @property({type:CCInteger,visible:function(this:GainLoot){
    return !this.isNumOfLootFromDataCollector
  }})
  numOfLoot = 0;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    let initialNumOfLoot =this.numOfLoot 
    if(this.isNumOfLootFromDataCollector){
 const collectedData=    await this.numOfLootDataCollector?.collectData({
        cardPlayerId: WrapperProvider.playerManagerWrapper.out.getPlayerByCard(this.getEffectCard()!)!.playerId
      }) as EffectTarget
      initialNumOfLoot = collectedData.effectTargetNumber
    }
          const targets = data.getTargets(TARGETTYPE.PLAYER)
      if (targets.length == 0) {
        console.log(`no targets`)
        if (data instanceof PassiveEffectData) return data
        return stack
      }
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const playerComp = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target as Node)!;
        const numOfLoot= this.getQuantityInRegardsToBlankCard(playerComp.node,initialNumOfLoot)
        for (let j = 0; j < numOfLoot; j++) {
          await playerComp.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true)
        }
      }  
    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
