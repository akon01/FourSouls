import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import MonsterReward from "./MonsterReward";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RollGainLoot extends MonsterReward {

  @property({ override: true })
  hasRoll: boolean = true

  rollNumber: number = 0;

  @property
  numOfLootToAdd: number = 0;

  async rewardPlayer(playerToReward: cc.Node, sendToServer: boolean) {
    let player = playerToReward.getComponent(Player)
    let diceId = player.dice.diceId
    let rollAnswer = this.rollNumber
    for (let index = 0; index < rollAnswer; index++) {
      await player.drawCard(CardManager.lootDeck, sendToServer)
    }
    return true

  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
