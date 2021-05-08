import { CCInteger, Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Player } from '../../Entites/GameEntities/Player';
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
  isNumOfLootFromDataCollector = false

  @property({
    type: DataCollector, visible: function (this: GainLoot) {
      return this.isNumOfLootFromDataCollector
    }
  })
  numOfLootDataCollector: DataCollector | null = null

  @property({
    type: CCInteger, visible: function (this: GainLoot) {
      return !this.isNumOfLootFromDataCollector
    }
  })
  numOfLoot = 0;
  currTargets: StackEffectInterface[] | Node[] | number[] | Effect[] = [];

  finalNumOfLoot: number = 0
  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    this.currData = data
    this.currStack = stack
    let initialNumOfLoot = this.numOfLoot
    const targets = data.getTargets(TARGETTYPE.PLAYER)
    if (targets.length == 0) {
      throw new CardEffectTargetError(`No Target Players Found`, true, data, stack)
    }
    this.currTargets = targets
    if (this.isNumOfLootFromDataCollector) {
      //  const collectedData = 
      return (this.numOfLootDataCollector!.collectData({
        cardPlayerId: WrapperProvider.playerManagerWrapper.out.getPlayerByCard(this.getEffectCard()!)!.playerId
      }) as Promise<EffectTarget>).then(collectedData => {
        initialNumOfLoot = collectedData.effectTargetNumber
        return this.startAsyncLoop(initialNumOfLoot);
      })
    }

    return this.startAsyncLoop(initialNumOfLoot);
  }

  private startAsyncLoop(initialNumOfLoot: number) {
    this.finalNumOfLoot = initialNumOfLoot;
    return this.handleTarget(0, this.currTargets.length);
  }

  handleTarget(index: number, length: number) {
    const target = this.currTargets[index]
    const playerComp = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target as Node)!;
    const numOfLoot = this.getQuantityInRegardsToBlankCard(playerComp.node, this.finalNumOfLoot)
    return this.handleDrawCard(0, numOfLoot, playerComp, { index, length })
  }

  handleDrawCard(index: number, length: number, playerComp: Player, origAsyncData: { index: number, length: number }): Promise<StackEffectInterface[] | PassiveEffectData> {
    return playerComp.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true).then(_ => {
      return this.handleAfterCard(index++, length, playerComp, origAsyncData)
    })
  }
  handleAfterCard(index: number, length: number, playerComp: Player, origAsyncData: { index: number, length: number }): Promise<StackEffectInterface[] | PassiveEffectData> {
    if (index < length) {
      return this.handleDrawCard(index, length, playerComp, origAsyncData)
    }
    return this.handleAfterTarget(origAsyncData.index++, origAsyncData.length, this.handleTarget, this)
  }
}
