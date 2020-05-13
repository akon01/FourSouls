import Player from "../../Entites/GameEntities/Player";
import MonsterReward from "./MonsterReward";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RollGainMoney extends MonsterReward {

  @property({ override: true })
  hasRoll: boolean = true

  rollNumber: number = 0;

  doubleReward: boolean = false;


  @property
  numOfMoneyToAdd: number = 0;

  async rewardPlayer(playerToReward: cc.Node, sendToServer: boolean) {
    const player = playerToReward.getComponent(Player)
    const diceId = player.dice.diceId

    let rollAnswer = this.rollNumber
    // let rollAnswer = await this.dataCollector.collectData({ cardPlayerId: player.playerId, cardId: diceId })

    //await player.changeMoney(rollAnswer.numberRolled, sendToServer)
    if (this.doubleReward) {
      rollAnswer += rollAnswer
    }
    await player.changeMoney(rollAnswer, sendToServer)
    return true

  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
