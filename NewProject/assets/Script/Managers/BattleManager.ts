import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import MonsterReward from "../CardEffectComponents/MonsterRewards/MonsterReward";
import { PARTICLE_TYPES, REWARD_TYPES, STACK_EFFECT_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Card from "../Entites/GameEntities/Card";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import ActionManager from "./ActionManager";
import ParticleManager from "./ParticleManager";
import PlayerManager from "./PlayerManager";
import TurnsManager from "./TurnsManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleManager extends cc.Component {
  static currentlyAttackedMonsterNode: cc.Node = null;

  static currentlyAttackedMonster: Monster = null;

  static firstAttack: boolean = true;

  static inBattle: boolean = false;

  @property({ type: [MonsterReward] })
  availableReward: MonsterReward[] = []

  static getRewardByType(type: REWARD_TYPES) {
    return BattleManager.$.availableReward.filter(reward => reward.type == type)[0]
  }

  static $: BattleManager = null

  static async declareAttackOnMonster(monsterCard: cc.Node, sendToServer: boolean) {
    //
    BattleManager.currentlyAttackedMonsterNode = monsterCard;
    BattleManager.currentlyAttackedMonster = monsterCard.getComponent(Monster);
    monsterCard.getComponent(Monster)._isAttacked = true
    // ;
    TurnsManager.currentTurn.battlePhase = true;
    this.inBattle = true

    if (sendToServer) {
      ParticleManager.activateParticleEffect(monsterCard, PARTICLE_TYPES.MONSTER_IN_BATTLE, true)
      await ActionManager.updateActions();
    }
  }

  static endBattle(sendToServer: boolean) {
    const monsterCard = BattleManager.currentlyAttackedMonsterNode
    monsterCard.getComponent(Monster)._isAttacked = false
    BattleManager.currentlyAttackedMonster = null;
    BattleManager.currentlyAttackedMonsterNode = null;
    TurnsManager.currentTurn.battlePhase = false;
    if (sendToServer) {
      if (monsterCard) {
        ParticleManager.disableParticleEffect(monsterCard, PARTICLE_TYPES.MONSTER_IN_BATTLE, true)
      }
      ServerClient.$.send(Signal.END_BATTLE)
    }
    this.inBattle = false;
  }

  static async cancelAttack(sendToServer: boolean) {

    if (sendToServer) {
      this.endBattle(sendToServer)
      const currentStackEffectOfTheAttack = Stack._currentStack.filter(stackEffect => {
        if (stackEffect.stackEffectType == STACK_EFFECT_TYPE.ATTACK_ROLL || stackEffect.stackEffectType == STACK_EFFECT_TYPE.COMBAT_DAMAGE) { return true }
      })
      for (const stackEffect of currentStackEffectOfTheAttack) {
        await Stack.fizzleStackEffect(stackEffect, false, true)
      }

    }
  }

  /**
   * @returns true if hit, false if miss
   * @param rollValue dice roll
   */
  ////@printMethodStarted(COLORS.RED)
  static async rollOnMonster(rollValue: number, sendToServer?: boolean) {
    const monsterRollValue = this.currentlyAttackedMonster.rollValue + this.currentlyAttackedMonster._rollBonus;
    // let turnPlayer = PlayerManager.getPlayerById(
    //   TurnsManager.currentTurn.PlayerId
    // )
    if (this.firstAttack) {
      this.firstAttack = false;
    }
    if (rollValue >= monsterRollValue) {
      return true;
    } else { return false; }
  }

  // static async killMonster(monsterCard: cc.Node, sendToServer?: boolean) {

  //   await monsterCard.getComponent(Monster).kill(sendToServer)
  // }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    BattleManager.$ = this;
  }

  start() { }

  // update (dt) {}
}
