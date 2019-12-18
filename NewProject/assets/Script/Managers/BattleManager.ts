import Monster from "../Entites/CardTypes/Monster";
import Player from "../Entites/GameEntities/Player";
import ActionManager from "./ActionManager";
import PlayerManager from "./PlayerManager";
import TurnsManager from "./TurnsManager";
import Stack from "../Entites/Stack";
import { STACK_EFFECT_TYPE, PARTICLE_TYPES } from "../Constants";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import Card from "../Entites/GameEntities/Card";
import ParticleManager from "./ParticleManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleManager extends cc.Component {
  static currentlyAttackedMonsterNode: cc.Node = null;

  static currentlyAttackedMonster: Monster = null;

  static firstAttack: boolean = true;

  static inBattle: boolean = false;

  static async declareAttackOnMonster(monsterCard: cc.Node) {
    // 
    BattleManager.currentlyAttackedMonsterNode = monsterCard;
    BattleManager.currentlyAttackedMonster = monsterCard.getComponent(Monster);
    // ;


    ParticleManager.activateParticleEffect(monsterCard, PARTICLE_TYPES.MONSTER_IN_BATTLE, true)

    // let part = monsterCard.getComponent(Card).availableParticles.find(particle => particle.name == 'monsterInFight')

    // monsterCard.getComponentInChildren(cc.ParticleSystem).stopSystem()
    // monsterCard.getComponentInChildren(cc.ParticleSystem).file = part as unknown as string;


    // monsterCard.getComponentInChildren(cc.ParticleSystem).resetSystem()


    TurnsManager.currentTurn.battlePhase = true;
    this.inBattle = true

    // let turnPlayer = PlayerManager.getPlayerById(
    //   TurnsManager.currentTurn.PlayerId
    // );

    await ActionManager.updateActions();
  }

  static endBattle() {
    let monsterCard = BattleManager.currentlyAttackedMonsterNode
    BattleManager.currentlyAttackedMonster = null;
    BattleManager.currentlyAttackedMonsterNode = null;
    TurnsManager.currentTurn.battlePhase = false;
    ParticleManager.disableParticleEffect(monsterCard, PARTICLE_TYPES.MONSTER_IN_BATTLE, true)
    this.inBattle = false;
  }

  static async cancelAttack(sendToServer: boolean) {

    this.endBattle()
    if (sendToServer) {
      let currentStackEffectOfTheAttack = Stack._currentStack.filter(stackEffect => {
        if (stackEffect.stackEffectType == STACK_EFFECT_TYPE.ATTACK_ROLL || stackEffect.stackEffectType == STACK_EFFECT_TYPE.COMBAT_DAMAGE) return true
      })
      for (const stackEffect of currentStackEffectOfTheAttack) {
        await Stack.fizzleStackEffect(stackEffect, true)
      }
      ServerClient.$.send(Signal.CANCEL_ATTACK)
    }
  }

  /**
   * @returns true if hit, false if miss
   * @param rollValue dice roll
   */
  ////@printMethodStarted(COLORS.RED)
  static async rollOnMonster(rollValue: number, sendToServer?: boolean) {
    let monsterRollValue = this.currentlyAttackedMonster.rollValue + this.currentlyAttackedMonster.rollBonus;
    // let turnPlayer = PlayerManager.getPlayerById(
    //   TurnsManager.currentTurn.PlayerId
    // )
    if (this.firstAttack) {
      this.firstAttack = false;
    }
    if (rollValue >= monsterRollValue) {
      return true;
    } else return false;
  }



  // static async killMonster(monsterCard: cc.Node, sendToServer?: boolean) {

  //   await monsterCard.getComponent(Monster).kill(sendToServer) 
  // }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
