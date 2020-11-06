import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { MAX_TURNID } from "../Constants";
import Character from "../Entites/CardTypes/Character";
import Monster from "../Entites/CardTypes/Monster";
import Player from "../Entites/GameEntities/Player";
import MonsterField from "../Entites/MonsterField";
import Stack from "../Entites/Stack";
import { Turn } from "../Modules/TurnsModule";
import PlayerManager from "./PlayerManager";
import Store from "../Entites/GameEntities/Store";
import CardEffect from "../Entites/CardEffect";
import HeadlessHorsmanCondition from "../CardEffectComponents/CardConditions/Card Specific Conditions/Headless Horseman Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TurnsManager extends cc.Component {
  static turns: Turn[] = [];

  static turnId: number = 0;

  static currentTurn: Turn = null;

  static turnLable: cc.Label = null

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
      if (turn.PlayerId == playerId) { return turn; }
    }
  }

  /**
   *
   * @param sendToServer false if should not send an event.
   */
  static async nextTurn(sendToServer?: boolean) {

    if (Stack._currentStack.length > 0) {
      cc.log(`wait for stack to be emptied`)
      cc.log(Stack._currentStack)
      await Stack.waitForStackEmptied()
    }
    await Stack.replaceStack([], true)

    await this.endTurn(true);

    await this.setCurrentTurn(TurnsManager.getNextTurn(TurnsManager.currentTurn, this.turns), true);

    cc.find("MainScript").dispatchEvent(
      new cc.Event.EventCustom("turnChanged", true)
    );
    //  this.node.dispatchEvent(new cc.Event.EventCustom('turnChanged', true))
  }

  static async setCurrentTurn(turn: Turn, sendToServer: boolean) {

    if (sendToServer) {
      ServerClient.$.send(Signal.SET_TURN, { playerId: turn.PlayerId })
    }
    if (turn.PlayerId != 0) {
      turn.refreshTurn();
      this.turnLable.string = `Turn ` + turn.PlayerId
      TurnsManager.currentTurn = turn;
      if (sendToServer) { await turn.startTurn(); }
    }
  }

  static async endTurn(sendToServer: boolean) {
    TurnsManager.currentTurn.endTurn()
    if (
      this.getNextTurn(TurnsManager.currentTurn, TurnsManager.turns).PlayerId != 0
    ) {
      Store.thisTurnStoreCards = []
      for (const player of PlayerManager.players.map(player => player.getComponent(Player))) {
        player._tempHpBonus = 0
        player.tempAttackRollBonus = 0
        player.tempNonAttackRollBonus = 0
        player.tempFirstAttackRollBonus = 0
        player.tempNextAttackRollBonus=0
        player.tempBaseDamage = 0
        player.lastAttackRoll = 0
        player.lastRoll = 0
        player._lootCardsPlayedThisTurn = [];
        player.itemsLostThisTurn = []
        player._thisTurnKiller = null
        player._isFirstTimeGettingMoney = true;
        player._isFirstAttackRollOfTurn = true
        player._isDead = false;
        player.isFirstHitInTurn = true
        player._mustAttackPlays = 0;
        player._mustAttackMonsters = []
        player._mustDeckAttackPlays = 0
        player._attackDeckPlays = 0
        //player.damage = player.calculateDamage()
        // player.broadcastUpdateProperites({ _tempHpBonus: player._tempHpBonus, tempAttackRollBonus: player.tempAttackRollBonus})
        await player.heal(player.character.getComponent(Character).hp + player._hpBonus, false, true)
      }
      const activeMonsters = MonsterField.activeMonsters;
      const activeMonstersComps = activeMonsters.map(monster => monster.getComponent(Monster));
      for (const monster of activeMonstersComps) {
        monster._rollBonus = 0;
        monster._bonusDamage = 0;
        monster._thisTurnKiller = null;
        monster._lastHitRoll = 0
        await monster.heal(monster.HP, false, true)
      }
      ////Special Conditions To Do: TODO: Should not be here at all.
      const headlessHorsmanCard=activeMonstersComps.filter(c=>c.node.name=="Headless Horseman")[0]
      if(headlessHorsmanCard){
        const condition= headlessHorsmanCard.node.getComponentInChildren(HeadlessHorsmanCondition)
        condition._isFirstTime=true
      }
      if (sendToServer) {
        ServerClient.$.send(Signal.END_TURN)
      }
    }

  }

  static getNextTurn(currentTurn: Turn, turns: Turn[]): Turn {
    for (let i = 0; i < turns.length; i++) {
      const nextTurn = turns[i];
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
    const playerId = player.getComponent(Player).playerId
    if (TurnsManager.currentTurn.PlayerId == playerId) {
      return true;
    }
    return false;
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    TurnsManager.turnLable = cc.find(`Canvas/current Turn`).getComponent(cc.Label)
  }

  start() { }

  // update (dt) {}
}
