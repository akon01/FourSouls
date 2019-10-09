import { MAX_PLAYERS, MAX_TURNID } from "../Constants";

import ServerClient from "../../ServerClient/ServerClient";
import PlayerManager from "../Managers/PlayerManager";

import CardManager from "../Managers/CardManager";
import Player from "../Entites/GameEntities/Player";
import Signal from "../../Misc/Signal";

//make the turns ininitally
export function makeNextTurn(currentTurn: Turn): Turn[] {
  var turns: Turn[] = [];

  for (let i = 1; i < ServerClient.numOfPlayers + 1; i++) {
    turns.push(new Turn(i));
  }
  return turns;
}

export function getCurrentPlayer(players: cc.Node[], turn: Turn) {
  for (let i = 0; i < players.length; i++) {
    let player = players[i];
    let playerComp: Player = player.getComponent(Player);
    if (playerComp.playerId == turn.PlayerId) {
      return player;
    }
  }
  return null;
}

//Turn class
export class Turn {
  PlayerId: number;

  battlePhase: boolean = false;
  lootCardPlays: number = 1;
  drawPlays: number = 1;
  buyPlays: number = 1;
  attackPlays: number = 1;

  constructor(PlayerId: number) {
    this.PlayerId = PlayerId;
  }

  refreshTurn() {
    let player: Player = PlayerManager.getPlayerById(
      this.PlayerId
    ).getComponent(Player);
    this.lootCardPlays = player.lootCardPlays;
    this.drawPlays = player.drawPlays;
    this.buyPlays = player.buyPlays;
    this.attackPlays = player.attackPlays;
    this.battlePhase = false;
  }

  getTurnPlayer() {
    return PlayerManager.getPlayerById(this.PlayerId).getComponent(Player)
  }

  async startTurn() {
    let player: Player = PlayerManager.getPlayerById(
      this.PlayerId
    ).getComponent(Player);
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
