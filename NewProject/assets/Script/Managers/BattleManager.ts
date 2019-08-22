import Monster from "../Entites/CardTypes/Monster";
import Player from "../Entites/GameEntities/Player";
import ActionManager from "./ActionManager";
import PlayerManager from "./PlayerManager";
import TurnsManager from "./TurnsManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleManager extends cc.Component {
  static currentlyAttackedMonsterNode: cc.Node = null;

  static currentlyAttackedMonster: Monster = null;

  static firstAttack: boolean = true;

  static async declareAttackOnMonster(monsterCard: cc.Node) {
    // 
    BattleManager.currentlyAttackedMonsterNode = monsterCard;
    BattleManager.currentlyAttackedMonster = monsterCard.getComponent(Monster);
    // ;
    TurnsManager.currentTurn.battlePhase = true;

    let turnPlayer = PlayerManager.getPlayerById(
      TurnsManager.currentTurn.PlayerId
    );

    await ActionManager.updateActions();
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
      return true;
    } else return false;
  }

  static async checkIfPlayerIsDead(sendToServer: boolean) {
    for (const player of PlayerManager.players) {
      let playerComp = player.getComponent(Player);
      if (playerComp._Hp <= 0) {
        await playerComp.killPlayer(sendToServer);
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

    await monsterCard.getComponent(Monster).kill(sendToServer)
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
