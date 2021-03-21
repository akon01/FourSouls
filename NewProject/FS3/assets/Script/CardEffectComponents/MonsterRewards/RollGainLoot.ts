import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { REWARD_TYPES } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { CardManager } from "../../Managers/CardManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { MonsterReward } from "./MonsterReward";

@ccclass('RollGainLoot')
export class RollGainLoot extends MonsterReward {
      @property({ override: true })
      hasRoll: boolean = true
      rollNumber: number = 0;
      @property
      numOfLootToAdd: number = 0;
      type: REWARD_TYPES = REWARD_TYPES.rollLoot
      setRewardQuantity(number: number) {
            this.numOfLootToAdd = number
      }
      async rewardPlayer(playerToReward: Node, sendToServer: boolean) {
            const player = playerToReward.getComponent(Player)!
            let rollAnswer = this.rollNumber
            if (this.doubleReward) {
                  rollAnswer += rollAnswer
            }
            for (let index = 0; index < rollAnswer; index++) {
                  await player.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, sendToServer)
            }
            return true

      }
      // LIFate (dt) {}
}
