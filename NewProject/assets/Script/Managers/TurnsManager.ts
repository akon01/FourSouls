import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import PlayerManager from "./PlayerManager";
import Player from "../Entites/GameEntities/Player";
import Character from "../Entites/CardTypes/Character";
import MonsterField from "../Entites/MonsterField";
import Monster from "../Entites/CardTypes/Monster";
import Stack from "../Entites/Stack";
import { MAX_TURNID } from "../Constants";
import { Turn } from "../Modules/TurnsModule";

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

    // await Stack.replaceStack([], false)

    await this.endTurn();

    this.setCurrentTurn(TurnsManager.getNextTurn(TurnsManager.currentTurn, this.turns), true);

    cc.find("MainScript").dispatchEvent(
      new cc.Event.EventCustom("turnChanged", true)
    );
    //  this.node.dispatchEvent(new cc.Event.EventCustom('turnChanged', true))
  }

  static setCurrentTurn(turn: Turn, sendToServer: boolean) {

    if (sendToServer) {
      ServerClient.$.send(Signal.SET_TURN, { playerId: turn.PlayerId })
    }
    if (turn.PlayerId != 0) {
      turn.refreshTurn();
      cc.log(`after refresh turn`)
      TurnsManager.currentTurn = turn;
      if (sendToServer) turn.startTurn();
    }
  }

  static async endTurn() {
    if (
      this.getNextTurn(TurnsManager.currentTurn, TurnsManager.turns).PlayerId != 0
    ) {
      for (const player of PlayerManager.players.map(player => player.getComponent(Player))) {
        player._tempHpBonus = 0
        player.tempAttackRollBonus = 0
        player.tempNonAttackRollBonus = 0
        player.tempFirstAttackRollBonus = 0
        player._lootCardsPlayedThisTurn = [];
        player._thisTurnKiller = null
        await player.heal(player.character.getComponent(Character).Hp + player._hpBonus, true)
      }
      for (const monster of MonsterField.activeMonsters.map(monster => monster.getComponent(Monster))) {
        monster.rollBonus = 0;
        monster.bonusDamage = 0;
        monster._thisTurnKiller = null;
        await monster.heal(monster.HP, true)
      }

    }
  }

  static getNextTurn(currentTurn: Turn, turns: Turn[]): Turn {
    for (let i = 0; i < turns.length; i++) {
      let nextTurn = turns[i];
      if (currentTurn.PlayerId == PlayerManager.players.length) {
        if (nextTurn.PlayerId == 1) {
          return nextTurn;
        }
      }
      if (nextTurn.PlayerId == currentTurn.PlayerId + 1) {
        return nextTurn;
      }
    }
    return null;
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
