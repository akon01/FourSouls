/**
 * Match entity
 * @author wheatup
 */
//@ts-nocheck
import signal from "../enums/signal";
import Server from "../server";
import { Logger } from "../utils/Logger";
import Utils from "../utils/utils";
import ServerPlayer from "./ServerPlayer";
import { ServerCard } from "./ServerCard";
import DataParser from "./dataParser";

const MIID = 0;
export default class Match {
  static pendingMatches: Match[] = [];

  static getMatch(): Match {
    if (Match.pendingMatches.length > 0) {
      return Match.pendingMatches[0];
    } else {
      const match = new Match();
      match.parser = new DataParser(match)
      Server.$.logger = new Logger();
      Match.pendingMatches.push(match);
      return match;
    }
  }

  cards: ServerCard[] = []
  parser: DataParser = null;
  loadedPlayers = 0;
  level = 0;
  firstPlayerId = 0;
  players: ServerPlayer[] = [];
  time = 120;
  letters: string = null;
  running = false;

  score = {};

  constructor() { }

  broadcast(signal: string, data?: any) {
    const totalPlayers = this.players.length;
    for (let i = totalPlayers - 1; i >= 0; i--) {
      const player = this.players[i];
      if (player) {
        player.send(signal, data);
      }
    }
  }

  getCardById(id: number) {
    if (this.cards.length == 0) return null;
    return this.cards.find(c => c.cardId == id)
  }

  getPlayerById(id: number): ServerPlayer {
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      if (player.uuid == id) {
        return player;
      }
    }
  }

  broadcastToPlayer(playerIdToSendTo: number, signal: string, data?: any) {
    const player = this.getPlayerById(playerIdToSendTo);
    if (player) {
      player.send(signal, data);
    }
  }

  broadcastToNextPlayer(
    currentPlayer: ServerPlayer,
    signal: string,
    data?: any
  ) {
    const totalPlayers = this.players.length;
    console.log(currentPlayer.uuid);
    let currentPlayerUuid = currentPlayer.uuid;
    if (currentPlayer.uuid == totalPlayers) {
      currentPlayerUuid = 0;
    }
    for (let i = totalPlayers - 1; i >= 0; i--) {
      const player = this.players[i];
      console.log("chekcing for player " + player.uuid);
      if (player.uuid == currentPlayerUuid + 1) {
        player.send(signal, data);
        break;
      }
    }
  }

  broadcastExept(excludedPlayer: ServerPlayer, signal: string, data?: any) {
    const totalPlayers = this.players.length;
    for (let i = totalPlayers - 1; i >= 0; i--) {
      const player = this.players[i];
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
    this.broadcast(signal.START_GAME, {});
    // setTimeout(() => {
    //   this.timeup();
    // }, this.time * 1000);
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
      const letters = Utils.generateLetters2(ids);
      const lettersArr = this.letters.split("");
      const score =
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
