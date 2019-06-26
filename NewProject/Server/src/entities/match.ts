/**
 * Match entity
 * @author wheatup
 */

import ServerPlayer from "./player";
import signal from "../enums/signal";
import Utils from "../utils/utils";
import Server from "../server";

let MIID = 0;
export default class Match {
  static pendingMatches: Match[] = [];

  static getMatch(): Match {
    if (Match.pendingMatches.length > 0) {
      return Match.pendingMatches[0];
    } else {
      let match = new Match();
      Match.pendingMatches.push(match);
      return match;
    }
  }

  loadedPlayers: number = 0;
  level: number = 0;
  firstPlayerId: number = 0;
  players: ServerPlayer[] = [];
  time: number = 120;
  letters: string = null;
  running: boolean = false;

  score = {};

  constructor() { }

  broadcast(signal: string, data?: any) {
    let totalPlayers = this.players.length;
    for (let i = totalPlayers - 1; i >= 0; i--) {
      let player = this.players[i];
      if (player) {
        player.send(signal, data);
      }
    }
  }

  getPlayerById(id): ServerPlayer {
    console.log("get Player by id");
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      if (player.uuid == id) {
        console.log(player.uuid);
        return player;
      }
    }
  }

  broadcastToNextPlayer(
    currentPlayer: ServerPlayer,
    signal: string,
    data?: any
  ) {
    let totalPlayers = this.players.length;
    console.log(currentPlayer.uuid);
    let currentPlayerUuid = currentPlayer.uuid;
    if (currentPlayer.uuid == totalPlayers) {
      currentPlayerUuid = 0;
    }
    for (let i = totalPlayers - 1; i >= 0; i--) {
      let player = this.players[i];
      console.log("chekcing for player " + player.uuid);
      if (player.uuid == currentPlayerUuid + 1) {
        player.send(signal, data);
        break;
      }
    }
  }

  broadcastExept(excludedPlayer: ServerPlayer, signal: string, data?: any) {
    let totalPlayers = this.players.length;
    for (let i = totalPlayers - 1; i >= 0; i--) {
      let player = this.players[i];
      if (player !== excludedPlayer) {
        player.send(signal, data);
      }
    }
  }

  start() {
    if (this.running) {
      return;
    }
    console.log("starting match");
    this.running = true;
    this.broadcast(signal.STARTGAME, {});
    setTimeout(() => {
      this.timeup();
    }, this.time * 1000);
    this.close();
  }

  stop() {
    this.running = false;
    this.broadcast(signal.RESULT, {
      interrupted: this.players.length < 2,
      score: this.score
    });
    this.close();
    this.players.forEach(player => {
      this.leave(player, true);
    });
  }

  timeup() {
    if (this.running) {
      this.stop();
    }
  }

  join(player: ServerPlayer) {
    //if more then 4 players try to join or the same player tries to join twice
    if (this.players.length >= 4 || this.players.indexOf(player) >= 0) {
      return;
    }
    console.log(this.players.length);

    this.players.push(player);
    for (const player of this.players) {
      player.match = this;
    }
    console.log("player " + player + " joined");

    this.broadcast(signal.JOIN, { uuid: player.uuid });
  }

  validate(player: ServerPlayer, ids: number[]) {
    let text = "";
    ids.forEach(id => {
      text += this.letters[id];
    });
    if (Utils.isWord(text.toLowerCase())) {
      let letters = Utils.generateLetters2(ids);
      let lettersArr = this.letters.split("");
      let score =
        Server.$.config.scoreMap[
        text.length < Server.$.config.scoreMap.length
          ? text.length
          : Server.$.config.scoreMap.length - 1
        ];
      ids.forEach((id, index) => {
        lettersArr[id] = letters[index];
      });
      this.letters = lettersArr.join("");
      this.score[player.uuid].score += score;
      this.broadcast(signal.CORRECT, {
        uuid: player.uuid,
        ids,
        word: text,
        letters,
        score
      });
    } else {
      this.broadcast(signal.WRONG, { uuid: player.uuid, ids });
    }
  }

  leave(player: ServerPlayer, silence?: boolean) {
    // if (this.players.indexOf(player) < 0) {
    // 	return;
    // }
    // player.match = null;
    // this.players.splice(this.players.indexOf(player), 1);
    // if (!silence) {
    // 	this.broadcast(signal.LEAVE, { uuid: player.uuid });
    // }
    if (this.running) {
      this.stop();
    }
    this.close();
  }

  close() {
    if (Match.pendingMatches.indexOf(this) >= 0) {
      Match.pendingMatches.splice(Match.pendingMatches.indexOf(this), 1);
    }
  }
}
