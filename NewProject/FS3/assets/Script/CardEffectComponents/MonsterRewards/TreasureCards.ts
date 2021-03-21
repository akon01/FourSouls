import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { REWARD_TYPES } from "../../Constants";
import { Deck } from "../../Entites/GameEntities/Deck";
import { Player } from "../../Entites/GameEntities/Player";
import { CardManager } from "../../Managers/CardManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from "../DataCollector/DataCollector";
import { MonsterReward } from "./MonsterReward";

@ccclass('TreasureCards')
export class TreasureCards extends MonsterReward {
      @property({ override: true })
      hasRoll: boolean = false
      rollNumber: number = 0;
      type: REWARD_TYPES = REWARD_TYPES.treasure
      @property
      numOfIemsToGet: number = 0;
      setRewardQuantity(number: number) {
            this.numOfIemsToGet = number
      }
      async rewardPlayer(playerToReward: Node, sendToServer: boolean) {
            if (this.doubleReward) {
                  this.numOfIemsToGet += this.numOfIemsToGet
            }
            const treasureDeck = WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!;
            for (let i = 0; i < this.numOfIemsToGet; i++) {

                  const over = await playerToReward.getComponent(Player)!.addItem(treasureDeck.node, sendToServer, true)

            }
            return new Promise((resolve, reject) => resolve(true))
      }

}
