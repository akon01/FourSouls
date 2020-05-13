import { MAX_PLAYERS, MAX_TURNID } from "../Constants";

import ServerClient from "../../ServerClient/ServerClient";
import PlayerManager from "../Managers/PlayerManager";

import Signal from "../../Misc/Signal";
import Player from "../Entites/GameEntities/Player";
import CardManager from "../Managers/CardManager";
import TurnsManager from "../Managers/TurnsManager";

//make the turns ininitally
export function makeNextTurn(currentTurn: Turn): Turn[] {
  let turns: Turn[] = [];

  for (let i = 1; i < ServerClient.numOfPlayers + 1; i++) {
    turns.push(new Turn(i));
  }
  return turns;
}

export function getCurrentPlayer(players: cc.Node[], turn: Turn) {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const playerComp: Player = player.getComponent(Player);
    if (playerComp.playerId == turn.PlayerId) {
      return player;
    }
  }
  return null;
}

//Turn class
export class Turn {
  PlayerId: number;
  turnId: number

  battlePhase: boolean = false;
  lootCardPlays: number = 1;
  drawPlays: number = 1;
  buyPlays: number = 1;
  attackPlays: number = 1;
  monsterDeckAttackPlays: number = 0;

  constructor(PlayerId: number) {
    this.PlayerId = PlayerId;
  }

  refreshTurn() {
    const player: Player = PlayerManager.getPlayerById(
      this.PlayerId
    )
    this.lootCardPlays = player.lootCardPlays;
    this.drawPlays = player.drawPlays;
    this.buyPlays = player.buyPlays;
    this.attackPlays = player.attackPlays;
    this.monsterDeckAttackPlays = player.monsterDeckAttackPlays
    this.battlePhase = false;
    this.turnId = ++TurnsManager.turnId

  }

  getTurnPlayer() {
    return PlayerManager.getPlayerById(this.PlayerId)
  }

  async startTurn() {
    cc.log(`start turn`)
    const player: Player = PlayerManager.getPlayerById(
      this.PlayerId
    )
    cc.log(`turn player ${player.name}`)
    cc.log(`me player ${PlayerManager.mePlayer.name}`)
    if (player.node.name == PlayerManager.mePlayer.name) {
      await player.startTurn(this.drawPlays, player.activeItems.length, true)
    } else {
      ServerClient.$.send(Signal.START_TURN, { playerId: player.playerId })
    }
    // //draw cards
    //  for (let i = 0; i < this.drawPlays; i++) {
    //     player.drawCard(CardManager.);
    //  }
    //charge items
    //  const playerCards = player.cards;
    //  for (let j = 0; j < playerCards.length; j++) {
    //      const card = playerCards[j];
    //     chargeCard(card);
    //  }
  }
}
