import DataCollector from "../DataCollector/DataCollector";
import Player from "../../Entites/GameEntities/Player";
import MonsterReward from "./MonsterReward";
import CardManager from "../../Managers/CardManager";
import RollDice from "../RollDice";
import { ROLL_TYPE } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RollGainMoney extends MonsterReward {

  @property({ override: true })
  hasRoll: boolean = true

  rollNumber: number = 0;


  @property
  numOfMoneyToAdd: number = 0;

  async rewardPlayer(playerToReward: cc.Node, sendToServer: boolean) {
    let player = playerToReward.getComponent(Player)
    let diceId = player.dice.diceId

    let rollAnswer = this.rollNumber
    // let rollAnswer = await this.dataCollector.collectData({ cardPlayerId: player.playerId, cardId: diceId })

    //await player.changeMoney(rollAnswer.numberRolled, sendToServer)
    await player.changeMoney(rollAnswer, sendToServer)
    return true

  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
