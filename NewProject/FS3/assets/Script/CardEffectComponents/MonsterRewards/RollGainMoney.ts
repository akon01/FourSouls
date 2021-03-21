import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { REWARD_TYPES } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { MonsterReward } from "./MonsterReward";

@ccclass('RollGainMoney')
export class RollGainMoney extends MonsterReward {
      @property({ override: true })
      hasRoll: boolean = true
      rollNumber: number = 0;
      doubleReward: boolean = false;
      type: REWARD_TYPES = REWARD_TYPES.rollMoney
      setRewardQuantity(number: number) {
            //this.numOfMoneyToAdd = number
      }
      @property
      numOfMoneyToAdd: number = 0;
      async rewardPlayer(playerToReward: Node, sendToServer: boolean) {
            const player = playerToReward.getComponent(Player)!
            const diceId = player.dice!.diceId

            let rollAnswer = this.rollNumber
            //     let rollAnswer = await this.dataCollector.collectData({ cardPlayerId: player.playerId, cardId: diceId })

            //     await player.changeMoney(rollAnswer.numberRolled, sendToServer)
            if (this.doubleReward) {
                  rollAnswer += rollAnswer
            }
            await player.changeMoney(rollAnswer, sendToServer)
            return true

      }

}
