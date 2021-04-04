import { _decorator, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { Stack } from "../../Entites/Stack";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('AddMoney')
export class AddMoney extends Effect {
      effectName = "addMoney";
      @property({
            visible: function (this: AddMoney) {
                  return !this.isAllMoneyTargetHas && !this.isGetNumOfCoinsFromDataCollector
            }
      })
      numOfCoins: number = 0;

      @property
      isAllMoneyTargetHas: boolean = false

      @property
      multiTarget: boolean = false;

      @property
      isGetNumOfCoinsFromDataCollector: boolean = false

      /**
       *
       * @param data {target:PlayerId}
       */
      async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

            let numOfCoins = this.numOfCoins
            if (this.isGetNumOfCoinsFromDataCollector) {
                  numOfCoins = data?.getTarget(TARGETTYPE.NUMBER)! as number
            }
            if (this.hasLockingResolve) {
                  numOfCoins = this.lockingResolve
            }
            if (!data) { debugger; throw new Error("No Data!"); }
            if (this.multiTarget) {
                  let targets = data.getTargets(TARGETTYPE.PLAYER)
                  if (targets.length == 0) {
                        throw new Error(`no targets`)
                  }
                  for (let i = 0; i < targets.length; i++) {
                        const target = targets[i] as Node;
                        const targetPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target as Node)!;
                        if (this.isAllMoneyTargetHas) {
                              numOfCoins = targetPlayer.coins
                        }
                        await targetPlayer.changeMoney(numOfCoins, true)
                  }
            } else {
                  let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
                  if (targetPlayerCard == null) {
                        console.log(`target player is null`)
                  } else {
                        let player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard as Node)!
                        if (this.isAllMoneyTargetHas) {
                              numOfCoins = player.coins
                        }
                        await player.changeMoney(numOfCoins, true);
                  }

            }

            if (data instanceof PassiveEffectData) return data
            return WrapperProvider.stackWrapper.out._currentStack
      }
}
