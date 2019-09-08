import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { getNextTurn, Turn } from "../Modules/TurnsModule";
import PlayerManager from "./PlayerManager";
import Player from "../Entites/GameEntities/Player";
import Character from "../Entites/CardTypes/Character";
import MonsterField from "../Entites/MonsterField";
import Monster from "../Entites/CardTypes/Monster";
import Stack from "../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TurnsManager extends cc.Component {
  static turns: Turn[] = [];

  static turnId: number = 0;

  static currentTurn: Turn = null;

  static init() {

    this.makeTurns();
    TurnsManager.currentTurn = TurnsManager.turns[1];

    //TurnsManager.currentTurn = this.turns[Math.floor((Math.random() * Server.numOfPlayers))]
  }
  static makeTurns() {
    for (let i = 1; i < ServerClient.numOfPlayers + 1; i++) {
      this.turns.push(new Turn(i));
    }
  }

  static getCurrentTurn() {
    return TurnsManager.currentTurn;
  }

  static getTurns() {
    return TurnsManager.turns;
  }

  static getTurnByPlayerId(playerId: number) {
    cc.log(`searching for turn ${playerId}`)
    for (const turn of this.turns) {
      cc.log(turn)
      if (turn.PlayerId == playerId) return turn;
    }
  }

  /**
   *
   * @param sendToServer false if should not send an event.
   */
  static async nextTurn(sendToServer?: boolean) {

    await Stack.replaceStack([], false)

    this.endTurn();

    this.setCurrentTurn(getNextTurn(TurnsManager.currentTurn, this.turns), false);

    cc.find("MainScript").dispatchEvent(
      new cc.Event.EventCustom("turnChanged", true)
    );
    //  this.node.dispatchEvent(new cc.Event.EventCustom('turnChanged', true))
  }

  static setCurrentTurn(turn: Turn, sendToServer: boolean) {

    if (turn.PlayerId != 0) {
      turn.refreshTurn();
      TurnsManager.currentTurn = turn;
      turn.startTurn();
    }
    if (sendToServer) {
      ServerClient.$.send(Signal.SET_TURN, { playerId: turn.PlayerId })
    }
  }

  static endTurn() {
    if (
      getNextTurn(TurnsManager.currentTurn, TurnsManager.turns).PlayerId != 0
    ) {
      for (const player of PlayerManager.players.map(player => player.getComponent(Player))) {
        player._hpBonus = 0
        player.attackRollBonus = 0
        player.nonAttackRollBonus = 0
        player.firstAttackRollBonus = 0
        player._lootCardsPlayedThisTurn = [];
      }
      for (const monster of MonsterField.activeMonsters.map(monster => monster.getComponent(Monster))) {
        monster.rollBonus = 0;
        monster.bonusDamage = 0;
      }

    }
  }

  static setTurns(turns2: Turn[]) {
    TurnsManager.turns = turns2;
  }

  static isCurrentPlayer(player: cc.Node): boolean {
    let playerId = player.getComponent(Player).playerId
    if (TurnsManager.currentTurn.PlayerId == playerId) {
      return true;
    }
    return false;
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() { }

  start() { }

  // update (dt) {}
}
