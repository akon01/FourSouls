import { ROLL_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Dice from "../Entites/GameEntities/Dice";
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

  static declareAttackOnMonster(monsterCard: cc.Node) {
    BattleManager.currentlyAttackedMonsterNode = monsterCard;
    BattleManager.currentlyAttackedMonster = monsterCard.getComponent(Monster);
    TurnsManager.currentTurn.battlePhase = true;
    //cc.log(MainScript.currentPlayerComp)
    let turnPlayer = PlayerManager.getPlayerById(
      TurnsManager.currentTurn.PlayerId
    );
    //currently only add one roll
    turnPlayer
      .getComponent(Player)
      .dice.getComponent(Dice)
      .addRollAction(ROLL_TYPE.FIRSTATTACK);
    ActionManager.updateActions();
  }

  /**
   * @returns true if hit, false if miss
   * @param rollValue dice roll
   */
  static rollOnMonster(rollValue: number): boolean {
    if (this.firstAttack) {
      this.firstAttack = false;
    }
    if (rollValue >= this.currentlyAttackedMonster.rollValue) {
      return true;
    } else return false;
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {}

  // update (dt) {}
}
