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
      numOfCoins = 0;

      @property
      isAllMoneyTargetHas = false

      @property
      isGetNumOfCoinsFromDataCollector = false

      @property
      isMultipliedBy = false

      @property({
            visible: function (this: AddMoney) {
                  return this.isMultipliedBy
            }
      })
      multiplyBy = 1

      /**
       *
       * @param data {target:PlayerId}
       */
      async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

            let numOfCoins = this.numOfCoins
            if (this.isGetNumOfCoinsFromDataCollector) {
                  if (!data) throw new Error("No Data Collected When Needed");

                  numOfCoins = data.getTarget(TARGETTYPE.NUMBER)! as number
            }
            if (this.hasLockingResolve) {
                  numOfCoins = this.lockingResolve
            }
            if (!data) { debugger; throw new Error("No Data!"); }

            const targets = data.getTargets(TARGETTYPE.PLAYER)
            if (targets.length == 0) {
                  throw new Error(`no targets`)
            }
            for (let i = 0; i < targets.length; i++) {
                  const target = targets[i] as Node;
                  await this.addMoneyToPlayer(target, numOfCoins);
            }


            if (data instanceof PassiveEffectData) return data
            return WrapperProvider.stackWrapper.out._currentStack
      }

      private async addMoneyToPlayer(target: Node, numOfCoins: number) {
            const targetPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target as Node)!;
            if (this.isAllMoneyTargetHas) {
                  numOfCoins = targetPlayer.coins;
            }
            numOfCoins = this.isMultipliedBy ? numOfCoins * this.multiplyBy : numOfCoins
            await targetPlayer.changeMoney(this.getQuantityInRegardsToBlankCard(targetPlayer.node, numOfCoins), true);
      }
}
