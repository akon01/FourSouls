import { ROLL_TYPE, printMethodStarted, COLORS, CARD_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Dice from "../Entites/GameEntities/Dice";
import Player from "../Entites/GameEntities/Player";
import ActionManager from "./ActionManager";
import PlayerManager from "./PlayerManager";
import TurnsManager from "./TurnsManager";
import { Turn } from "../Modules/TurnsModule";
import PileManager from "./PileManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleManager extends cc.Component {
  static currentlyAttackedMonsterNode: cc.Node = null;

  static currentlyAttackedMonster: Monster = null;

  static firstAttack: boolean = true;

  static declareAttackOnMonster(monsterCard: cc.Node) {
    cc.log("declare attack");
    BattleManager.currentlyAttackedMonsterNode = monsterCard;
    BattleManager.currentlyAttackedMonster = monsterCard.getComponent(Monster);
    cc.log(BattleManager.currentlyAttackedMonster);
    TurnsManager.currentTurn.battlePhase = true;
    //cc.log(MainScript.currentPlayerComp)
    let turnPlayer = PlayerManager.getPlayerById(
      TurnsManager.currentTurn.PlayerId
    );
    //currently only add one roll
    // turnPlayer
    //   .getComponent(Player)
    //   .dice.getComponent(Dice)
    //   .addRollAction(ROLL_TYPE.FIRSTATTACK);
    ActionManager.updateActions();
  }

  /**
   * @returns true if hit, false if miss
   * @param rollValue dice roll
   */
  @printMethodStarted(COLORS.RED)
  static rollOnMonster(rollValue: number, sendToServer?: boolean) {
    let turnPlayer = PlayerManager.getPlayerById(
      TurnsManager.currentTurn.PlayerId
    ).getComponent(Player);
    if (this.firstAttack) {
      this.firstAttack = false;
    }
    if (rollValue >= this.currentlyAttackedMonster.rollValue) {
      let damage = turnPlayer.calculateDamage();
      cc.log("monster was hit with  " + damage + " damage");
      cc.log("monster HP " + this.currentlyAttackedMonster.currentHp);
      this.currentlyAttackedMonster.getDamaged(damage);
      cc.log("monster HP " + this.currentlyAttackedMonster.currentHp);
    } else {
      let damage = this.currentlyAttackedMonster.calculateDamage();
      cc.log("player was hit with  " + damage + " damage");
      cc.log("player HP " + turnPlayer.Hp);
      turnPlayer.getHit(damage);
      cc.log("player HP " + turnPlayer.Hp);
    }
    this.checkIfMonsterIsDead(this.currentlyAttackedMonster.node, sendToServer);
  }

  static checkIfMonsterIsDead(monsterCard: cc.Node, sendToServer?: boolean) {
    let monster = monsterCard.getComponent(Monster);
    if (monster.currentHp <= 0) {
      this.killMonster(monsterCard, sendToServer);

      return true;
    }
    return false;
  }

  static killMonster(monsterCard: cc.Node, sendToServer?: boolean) {
    let monsterPlace = monsterCard.getComponent(Monster).monsterPlace;
    let turnPlayer = PlayerManager.getPlayerById(
      TurnsManager.currentTurn.PlayerId
    ).getComponent(Player);
    if (PlayerManager.mePlayer == turnPlayer.node) {
      turnPlayer.getMonsterRewards(monsterCard);
    }
    if (monsterCard == this.currentlyAttackedMonster.node) {
      this.currentlyAttackedMonster = null;
      TurnsManager.currentTurn.battlePhase = false;
    }
    PileManager.addCardToPile(CARD_TYPE.MONSTER, monsterCard);
    //   monsterPlace.getNextMonster();
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {}

  // update (dt) {}
}
