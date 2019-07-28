import { ROLL_TYPE, COLORS, CARD_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Dice from "../Entites/GameEntities/Dice";
import Player from "../Entites/GameEntities/Player";
import ActionManager from "./ActionManager";
import PlayerManager from "./PlayerManager";
import TurnsManager from "./TurnsManager";
import { Turn } from "../Modules/TurnsModule";
import PileManager from "./PileManager";
import Card from "../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleManager extends cc.Component {
  static currentlyAttackedMonsterNode: cc.Node = null;

  static currentlyAttackedMonster: Monster = null;

  static firstAttack: boolean = true;

  static declareAttackOnMonster(monsterCard: cc.Node) {
    // 
    BattleManager.currentlyAttackedMonsterNode = monsterCard;
    BattleManager.currentlyAttackedMonster = monsterCard.getComponent(Monster);
    // ;
    TurnsManager.currentTurn.battlePhase = true;

    let turnPlayer = PlayerManager.getPlayerById(
      TurnsManager.currentTurn.PlayerId
    );

    ActionManager.updateActions();
  }

  /**
   * @returns true if hit, false if miss
   * @param rollValue dice roll
   */
  ////@printMethodStarted(COLORS.RED)
  static async rollOnMonster(rollValue: number, sendToServer?: boolean) {
    let monsterRollValue = this.currentlyAttackedMonster.rollValue + this.currentlyAttackedMonster.rollBonus;
    let turnPlayer = PlayerManager.getPlayerById(
      TurnsManager.currentTurn.PlayerId
    ).getComponent(Player);
    if (this.firstAttack) {
      this.firstAttack = false;
    }
    if (rollValue >= monsterRollValue) {
      // let damage = turnPlayer.calculateDamage();
      // // 
      // // 
      // await this.currentlyAttackedMonster.getDamaged(damage, true);
      // // 
      return true;
    } else {
      // let damage = this.currentlyAttackedMonster.calculateDamage();
      // // 
      // // 
      // let gotHit = await turnPlayer.getHit(damage, true);
      // // 
      return false;
    }
    //  this.checkIfPlayerIsDead(sendToServer);
    let monsterIsDead = await this.checkIfMonsterIsDead(this.currentlyAttackedMonster.node, sendToServer);
    return monsterIsDead;
  }

  static checkIfPlayerIsDead(sendToServer: boolean) {
    for (const player of PlayerManager.players) {
      let playerComp = player.getComponent(Player);
      if (playerComp.Hp <= 0) {
        playerComp.killPlayer(sendToServer);
      }
    }
  }

  static async checkIfMonsterIsDead(monsterCard: cc.Node, sendToServer?: boolean) {
    let monster = monsterCard.getComponent(Monster);
    if (monster.currentHp <= 0) {

      await this.killMonster(monsterCard, sendToServer);

      return true;
    }
    return false;
  }

  static async killMonster(monsterCard: cc.Node, sendToServer?: boolean) {
    let monsterComp = monsterCard.getComponent(Monster)
    let monsterPlace = monsterComp.monsterPlace;
    let turnPlayer = PlayerManager.getPlayerById(
      TurnsManager.currentTurn.PlayerId
    ).getComponent(Player);
    if (PlayerManager.mePlayer == turnPlayer.node) {

      let over = await turnPlayer.getMonsterRewards(monsterCard, sendToServer);


      let cardComp = monsterCard.getComponent(Card)
      if (cardComp.souls == 0) {
        await PileManager.addCardToPile(CARD_TYPE.MONSTER, monsterCard, true);
      } else {

        turnPlayer.getSoulCard(monsterCard, sendToServer)
      }
    }
    if (this.currentlyAttackedMonster != null && monsterCard == this.currentlyAttackedMonster.node) {

      this.currentlyAttackedMonster = null;
      TurnsManager.currentTurn.battlePhase = false;
    }
    //   monsterPlace.getNextMonster();
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
