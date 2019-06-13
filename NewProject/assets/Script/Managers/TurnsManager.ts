import Signal from "../../Misc/Signal";
import Server from "../../ServerClient/ServerClient";
import { getNextTurn, Turn } from "../Modules/TurnsModule";
import PlayerManager from "./PlayerManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TurnsManager extends cc.Component {
  static turns: Turn[] = [];

  static turnId: number = 0;

  static currentTurn: Turn = null;

  static init() {
    ////cc.log('init turns')
    this.makeTurns();
    TurnsManager.currentTurn = TurnsManager.turns[1];

    //TurnsManager.currentTurn = this.turns[Math.floor((Math.random() * Server.numOfPlayers))]
  }
  static makeTurns() {
    for (let i = 1; i < Server.numOfPlayers + 1; i++) {
      this.turns.push(new Turn(i));
    }
  }

  static getCurrentTurn() {
    return TurnsManager.currentTurn;
  }

  static getTurns() {
    return TurnsManager.turns;
  }

  /**
   *
   * @param recivedEvent true if recived from the server and should not send an event.
   */
  static nextTurn(recivedEvent: boolean) {
    //cc.log(recivedEvent)
    if (recivedEvent) {
      this.endTurn();
      this.setCurrentTurn(getNextTurn(TurnsManager.currentTurn, this.turns));
    } else {
      let data = TurnsManager.currentTurn.PlayerId;
      Server.$.send(Signal.NEXTTURN, data);
      this.endTurn();
      this.setCurrentTurn(getNextTurn(TurnsManager.currentTurn, this.turns));
    }
    cc.find("MainScript").dispatchEvent(
      new cc.Event.EventCustom("turnChanged", true)
    );
    //  this.node.dispatchEvent(new cc.Event.EventCustom('turnChanged', true))
  }

  static setCurrentTurn(turn: Turn) {
    if (turn.PlayerId != 0) {
      turn.refreshTurn();
      TurnsManager.currentTurn = turn;
      turn.startTurn();
    }
  }

  static endTurn() {
    if (
      getNextTurn(TurnsManager.currentTurn, TurnsManager.turns).PlayerId != 0
    ) {
      //for each player heal to max hp
      for (let i = 0; i < PlayerManager.players.length; i++) {}
      //for each monster heal to max hp
    }
  }

  static setTurns(turns2: Turn[]) {
    TurnsManager.turns = turns2;
  }

  static isCurrentPlayer(playerId: number): boolean {
    if (TurnsManager.currentTurn.PlayerId == playerId) {
      return true;
    }
    return false;
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {}

  start() {}

  // update (dt) {}
}
