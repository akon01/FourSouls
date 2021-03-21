/**
 * Player entity
 * @author wheatup
 */
//@ts-nocheck
import WebSocket from "ws";
import Match from "./match";
declare const Buffer;

export default class ServerPlayer {
  static players: ServerPlayer[] = [];
  static UUID: number = 0;

  static getPlayer(ws: WebSocket) {
    //@ts-ignore

    if (ServerPlayer.getPlayerByWs(ws) == null) {
      let player = new ServerPlayer(ws, ++ServerPlayer.UUID);
      ServerPlayer.players.push(player);
      return player;
    } else {
      return ServerPlayer.getPlayerByWs(ws);
    }
  }

  ws: WebSocket = null;
  uuid: number = null;
  match: Match = null;

  constructor(ws: WebSocket, uuid: number) {
    this.ws = ws;
    this.uuid = uuid;
  }

  static getPlayerByWs(ws: WebSocket): ServerPlayer {
    for (let i = 0; i < ServerPlayer.players.length; i++) {
      const player = ServerPlayer.players[i];
      if (player.ws == ws) {
        return player;
      }
    }
    return null;
  }

  send(signal: string, data: any) {
    let pack = { signal, data };
    try {
      this.ws.send(Buffer.from(JSON.stringify(pack)).toString("base64"));
    } catch (ex) {
      // console.error(ex);
    }
  }

  remove() {
    if (this.match) {
      this.match.leave(this);
      this.match = null;
    }
    ServerPlayer.players.splice(
      ServerPlayer.players.indexOf(ServerPlayer.players[this.uuid]),
      1
    );
    --ServerPlayer.UUID;
  }
}
