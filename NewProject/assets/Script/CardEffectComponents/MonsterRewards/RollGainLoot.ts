import DataCollector from "../DataCollector/DataCollector";
import Player from "../../Entites/GameEntities/Player";
import MonsterReward from "./MonsterReward";
import CardManager from "../../Managers/CardManager";
import RollDice from "../RollDice";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RollGainLoot extends MonsterReward {
  @property({
    type: DataCollector,
    override: true
  })
  dataCollector: RollDice = null;

  @property
  numOfLootToAdd: number = 0;

  async rewardPlayer(playerToReward: cc.Node, sendToServer: boolean) {
    let player = playerToReward.getComponent(Player)
    let diceId = player.dice.diceId
    let rollAnswer = await this.dataCollector.collectData({ cardPlayerId: player.playerId, cardId: diceId })
    for (let index = 0; index < rollAnswer.numberRolled; index++) {
      await player.drawCard(CardManager.lootDeck, sendToServer)
    }
    return new Promise((resolve, reject) => resolve(true))

  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
