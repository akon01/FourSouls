import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { DataCollector } from "../DataCollector/DataCollector";
import { Player } from "../../Entites/GameEntities/Player";
import { MonsterReward } from "./MonsterReward";
import { CardManager } from "../../Managers/CardManager";
import { REWARD_TYPES } from "../../Constants";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('LootCards')
export class LootCards extends MonsterReward {
      @property({ override: true })
      hasRoll: boolean = false
      rollNumber: number = 0;
      type: REWARD_TYPES = REWARD_TYPES.loot
      @property
      numOfCardsToLoot: number = 0;
      setRewardQuantity(number: number) {
            this.numOfCardsToLoot = number
      }
      async rewardPlayer(playerToReward: Node, sendToServer: boolean) {
            if (this.doubleReward) {
                  this.numOfCardsToLoot += this.numOfCardsToLoot
            }
            let lootDeck = WrapperProvider.cardManagerWrapper.out.lootDeck;
            for (let i = 0; i < this.numOfCardsToLoot; i++) {
                  let over = await playerToReward.getComponent(Player)!.drawCards(lootDeck, sendToServer);
            }
            return new Promise((resolve, reject) => resolve(true))
      }

}
