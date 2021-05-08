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
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';

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
      currTargets: StackEffectInterface[] | Node[] | number[] | Effect[] = [];
      currData: ActiveEffectData | PassiveEffectData | null = null;
      currStack: StackEffectInterface[] = [];

      /**
       *
       * @param data {target:PlayerId}
       */
      doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

            let numOfCoins: number | null = this.numOfCoins
            if (this.isGetNumOfCoinsFromDataCollector) {
                  if (!data) throw new Error("No Data Collected When Needed");

                  numOfCoins = data.getTarget(TARGETTYPE.NUMBER)! as number | null
                  if (!numOfCoins) {
                        throw new CardEffectTargetError(`No Number Of Coins Found In Data`, false, data, stack)
                  }

            }
            if (this.hasLockingResolve) {
                  numOfCoins = this.lockingResolve
            }
            if (!data) { debugger; throw new Error("No Data!"); }

            const targets = data.getTargets(TARGETTYPE.PLAYER)
            if (targets.length == 0) {
                  throw new CardEffectTargetError(`target players are null`, true, data, stack)
            }
            this.currTargets = targets;
            this.currData = data;
            this.currStack = stack;
            const index = 0
            return this.addMoneyToPlayer(index, targets.length, numOfCoins)
      }


      private addMoneyToPlayer(index: number, length: number, numOfCoins: number): Promise<PassiveEffectData | StackEffectInterface[]> {
            const target = this.currTargets[index]
            const targetPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target as Node)!;
            if (this.isAllMoneyTargetHas) {
                  numOfCoins = targetPlayer.coins;
            }
            numOfCoins = this.isMultipliedBy ? numOfCoins * this.multiplyBy : numOfCoins
            return targetPlayer.changeMoney(this.getQuantityInRegardsToBlankCard(targetPlayer.node, numOfCoins), true).then(_ => {
                  return this.handleAfterAddMoney(index++, length, numOfCoins)
            });
      }
      private handleAfterAddMoney(index: number, length: number, numOfCoins: number): Promise<PassiveEffectData | StackEffectInterface[]> {
            if (index < length) {
                  return this.addMoneyToPlayer(index, length, numOfCoins)
            }
            return this.handleReturnValue()
      }
      private handleReturnValue(): Promise<PassiveEffectData | StackEffectInterface[]> {
            if (this.currData instanceof PassiveEffectData) return Promise.resolve(this.currData)
            return Promise.resolve(WrapperProvider.stackWrapper.out._currentStack)
      }
}
