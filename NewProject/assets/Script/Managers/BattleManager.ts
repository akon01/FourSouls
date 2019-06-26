import { ROLL_TYPE, printMethodStarted, COLORS, CARD_TYPE } from "../Constants";
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
    // //cc.log("declare attack");
    BattleManager.currentlyAttackedMonsterNode = monsterCard;
    BattleManager.currentlyAttackedMonster = monsterCard.getComponent(Monster);
    // //cc.log(BattleManager.currentlyAttackedMonster);
    TurnsManager.currentTurn.battlePhase = true;
    ////cc.log(MainScript.currentPlayerComp)
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
      let damage = turnPlayer.calculateDamage();
      // //cc.log("monster was hit with  " + damage + " damage");
      // //cc.log("monster HP " + this.currentlyAttackedMonster.currentHp);
      this.currentlyAttackedMonster.getDamaged(damage);
      // //cc.log("monster HP " + this.currentlyAttackedMonster.currentHp);
    } else {
      let damage = this.currentlyAttackedMonster.calculateDamage();
      // //cc.log("player was hit with  " + damage + " damage");
      // //cc.log("player HP " + turnPlayer.Hp);
      let gotHit = await turnPlayer.getHit(damage);
      // //cc.log("player HP " + turnPlayer.Hp);
    }
    //  this.checkIfPlayerIsDead(sendToServer);
    this.checkIfMonsterIsDead(this.currentlyAttackedMonster.node, sendToServer);
  }

  static checkIfPlayerIsDead(sendToServer: boolean) {
    for (const player of PlayerManager.players) {
      let playerComp = player.getComponent(Player);
      if (playerComp.Hp <= 0) {
        playerComp.killPlayer(sendToServer);
      }
    }
  }

  static checkIfMonsterIsDead(monsterCard: cc.Node, sendToServer?: boolean) {
    let monster = monsterCard.getComponent(Monster);
    if (monster.currentHp <= 0) {
      cc.log(sendToServer)
      this.killMonster(monsterCard, sendToServer);

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
      //cc.log('card rewards are over')
      let cardComp = monsterCard.getComponent(Card)
      if (cardComp.souls == 0) {
        PileManager.addCardToPile(CARD_TYPE.MONSTER, monsterCard, true);
      } else {
        //cc.log('card has souls, give it to player')
        turnPlayer.getSoulCard(monsterCard, sendToServer)
      }
    }
    if (monsterCard == this.currentlyAttackedMonster.node) {
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
