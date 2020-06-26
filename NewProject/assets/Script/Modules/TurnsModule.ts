import { MAX_PLAYERS, MAX_TURNID } from "../Constants";

import ServerClient from "../../ServerClient/ServerClient";
import PlayerManager from "../Managers/PlayerManager";

import Signal from "../../Misc/Signal";
import Player from "../Entites/GameEntities/Player";
import CardManager from "../Managers/CardManager";
import TurnsManager from "../Managers/TurnsManager";

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

  constructor(PlayerId: number) {
    this.PlayerId = PlayerId;
  }

  refreshTurn() {
    const player: Player = PlayerManager.getPlayerById(
      this.PlayerId
    )
    //add turn attack play
    player.attackPlays += 1
    //add turn loot card play
    player.lootCardPlays += 1
    //add turn buy play
    player.buyPlays += 1;
    cc.log(`refreshed turn for player ${player.playerId}`)
    this.battlePhase = false;
    this.turnId = ++TurnsManager.turnId

  }

  endTurn() {
    const player: Player = PlayerManager.getPlayerById(
      this.PlayerId
    )
    if (player.attackPlays > 0) {
      //remove turn attack play
      player.attackPlays -= 1
    }
    if (player.lootCardPlays > 0) {
      //remove turn loot card play
      player.lootCardPlays -= 1
    }
    if (player.buyPlays > 0) {
      //remove turn buy play
      player.buyPlays -= 1;
    }
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
      await player.startTurn(player.drawPlays, player.activeItems.length, true)
    } else {
      ServerClient.$.send(Signal.START_TURN, { playerId: player.playerId })
    }
  }
}
