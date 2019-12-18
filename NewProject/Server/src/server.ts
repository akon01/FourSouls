/**
 * Server
 * @author wheatup
 */

import WebSocket, { Server as WebSocketServer } from "ws";
import ServerPlayer from "./entities/player";

import * as whevent from "whevent";
import * as fs from "fs";
import signal from "./enums/signal";
import Match from "./entities/match";
import { Logger } from "./utils/Logger";

declare const Buffer;

export default class Server {
  static $: Server = null;

  wss: WebSocketServer = null;
  config: any = null;
  words: string[] = [];
  logger: Logger = null;

  constructor() {
    Server.$ = this;
  }

  async init() {
    console.log("Loading config...");

    this.config = await this.loadConfig();
    console.log("Setting up server...");
    this.setupWebSocket();
    this.bindEvents();
    this.logger = new Logger();
  }

  bindEvents() {

    whevent.on(signal.SET_MAX_ITEMS_STORE, this.onBroadcastExceptOrigin, this);

    whevent.on(signal.LOG, this.logFromPlayer, this);
    whevent.on(signal.LOG_ERROR, this.logErrorFromPlayer, this);

    whevent.on(signal.MATCH, this.onRequestMatch, this);
    whevent.on(signal.MOVE_TO_TABLE, this.moveToTable, this);
    whevent.on(signal.NEXT_TURN, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.START_GAME, this.onStartGame, this);
    whevent.on(signal.END_GAME, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.GAME_HAS_STARTED, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.FINISH_LOAD, this.onFinishLoad, this);
    whevent.on(signal.UPDATE_ACTIONS, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.VALIDATE, this.onValidate, this);
    whevent.on(signal.CARD_DRAWN, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.ADD_AN_ITEM, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.DECLARE_ATTACK, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.GET_REACTION, this.onSendToSpecificPlayer, this);
    // whevent.on(signal.FIRSTGETREACTION, this.onGetReaction, this);
    whevent.on(signal.RESOLVE_ACTIONS, this.onResolveActions, this);
    whevent.on(signal.DISCARD_LOOT, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.ACTIVATE_ITEM, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.NEW_MONSTER_ON_PLACE, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.SHOW_CARD_PREVIEW, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.ROLL_DICE, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.ROLL_DICE_ENDED, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.GET_NEXT_MONSTER, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.MOVE_CARD_TO_PILE, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.GET_SOUL, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.LOSE_SOUL, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.ADD_MONSTER, this.onBroadcastExceptOrigin, this);

    //Particle Signals
    whevent.on(signal.ACTIVATE_PARTICLE_EFFECT, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.DISABLE_PARTICLE_EFFECT, this.onBroadcastExceptOrigin, this);
    //


    //BOARD SIGANL
    whevent.on(signal.REMOVE_MONSTER, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.DRAW_CARD, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.DECK_ADD_TO_TOP, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.DECK_ADD_TO_BOTTOM, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.RECHARGE_ITEM, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.USE_ITEM, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.SET_TURN, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.ASSIGN_CHAR_TO_PLAYER, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.FLIP_CARD, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.REMOVE_ITEM_FROM_SHOP, this.onBroadcastExceptOrigin, this);

    whevent.on(signal.UPDATE_PASSIVE_DATA, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.CARD_GET_COUNTER, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.CANCEL_ATTACK, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.NEW_MONSTER_PLACE, this.onBroadcastExceptOrigin, this);



    whevent.on(signal.CHANGE_MONEY, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.ADD_STORE_CARD, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.REGISTER_PASSIVE_ITEM, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.REMOVE_FROM_PASSIVE_MANAGER, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.UPDATE_PASSIVES_OVER, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.REGISTER_ONE_TURN_PASSIVE_EFFECT, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.END_ROLL_ACTION, this.onBroadcastExceptOrigin, this);

    //stack events:

    whevent.on(signal.REPLACE_STACK, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.REMOVE_FROM_STACK, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.ADD_TO_STACK, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.ADD_RESOLVING_STACK_EFFECT, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.REMOVE_RESOLVING_STACK_EFFECT, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.UPDATE_STACK_VIS, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.UPDATE_STACK_LABLE, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.NEXT_STACK_ID, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.GIVE_PLAYER_PRIORITY, this.onBroadcastExceptOrigin, this);


    //player events
    whevent.on(signal.SET_MONEY, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.PLAYER_GAIN_ATTACK_ROLL_BONUS, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.PLAYER_GAIN_DMG, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.PLAYER_GAIN_HP, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.PLAYER_GAIN_ROLL_BONUS, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.PLAYER_GET_HIT, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.PLAYER_RECHARGE_ITEM, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.PLAY_LOOT_CARD, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.PLAYER_GET_LOOT, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.PLAYER_LOSE_LOOT, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.PLAYER_HEAL, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.PLAYER_ADD_DMG_PREVENTION, this.onBroadcastExceptOrigin, this);
    //

    //monster events
    whevent.on(signal.MONSTER_GAIN_DMG, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.MONSTER_GAIN_HP, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.MONSTER_GAIN_ROLL_BONUS, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.MONSTER_GET_DAMAGED, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.MONSTER_HEAL, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.MONSTER_ADD_DMG_PREVENTION, this.onBroadcastExceptOrigin, this);

    //

    whevent.on(signal.RESPOND_TO, this.onSendToSpecificPlayer, this);
    whevent.on(signal.FINISH_DO_STACK_EFFECT, this.onSendToSpecificPlayer, this);
    whevent.on(signal.DO_STACK_EFFECT, this.onSendToSpecificPlayer, this);
    whevent.on(signal.TURN_PLAYER_DO_STACK_EFFECT, this.onSendToSpecificPlayer, this);
    whevent.on(signal.START_TURN, this.onSendToSpecificPlayer, this);

    whevent.on(signal.DECK_ARRAGMENT, this.onBroadcastExceptOrigin, this);

    whevent.on(signal.MOVE_CARD, this.onBroadcastExceptOrigin, this);
    whevent.on(signal.MOVE_CARD_END, this.onSendToSpecificPlayer, this);
    whevent.on(signal.SOUL_CARD_MOVE_END, this.onSendToSpecificPlayer, this);
    whevent.on(signal.CARD_ADD_TRINKET, this.onBroadcastExceptOrigin, this);


    //eden events
    whevent.on(signal.EDEN_CHOSEN, this.onSendToSpecificPlayer, this);
    whevent.on(signal.CHOOSE_FOR_EDEN, this.onSendToSpecificPlayer, this);

    //Action Lable

    whevent.on(signal.ACTION_MASSAGE, this.onBroadcastExceptOrigin, this);

  }

  onBroadcastExceptOrigin({ player, data }) {
    player.match.broadcastExept(player, data.signal, data)
  }

  onSendToSpecificPlayer({ player, data }) {
    let playerToSendToId: number = data.data.playerId

    player.match.broadcastToPlayer(playerToSendToId, data.signal, data)
  }




  logFromPlayer({ player, data }) {
    this.logger.logFromPlayer(player.uuid, data)
  }

  logErrorFromPlayer({ player, data }) {
    this.logger.logErrorFromPlayer(player.uuid, data)
  }





  onRequestMatch({ player, data }) {

    if (ServerPlayer.players.length >= 2) {
      let match = Match.getMatch();
      match.join(player);
      this.logger.addAPlayerToMatch(player.uuid)
    }
  }

  onStartGame({ player, data }) {

    if (ServerPlayer.players.length >= 2) {
      console.log(
        "Starting match with " + player.match.players.length + " Players"
      );
      player.match.start();
    }
  }



  onFinishLoad({ player, data }) {

    player.match.loadedPlayers += 1;
    player.match.firstPlayerId = data.data.turnPlayerId

    if (player.match.loadedPlayers == player.match.players.length) {
      console.log('on finish load')
      player.match.broadcast(signal.FINISH_LOAD, { id: player.match.firstPlayerId })
    }
  }


  moveToTable({ player, data }) {
    console.log("Move to table request from players");
    player.send(signal.MOVE_TO_TABLE, {
      playerID: player.uuid,
      numOfPlayers: ServerPlayer.players.length
    });
  }








  //Stack events



  //END


  onResolveActions({ player, data }) {
    let firstPlayer = player.match.getPlayerById(data.data.originalPlayer);

    firstPlayer.send(signal.RESOLVE_ACTIONS, data);
    player.match.broadcastExept(
      firstPlayer,
      signal.OTHER_PLAYER_RESOLVE_REACTION,
      data
    );
    //add broadcast to other players with diffrent signal to exceute "other side action stack"
  }

  onValidate({ player, data }) {
    let match: Match = player.match;
    if (match && match.running) {
      match.validate(player, data.data);
    }
  }

  setupWebSocket() {
    //@ts-ignore
    this.wss = new WebSocketServer({ port: this.config.port }, () => {
      console.log(
        "\x1b[33m%s\x1b[0m",
        `Websocket server listening on port ${this.config.port}...`
      );
      this.wss.on("connection", ws => {
        let player = ServerPlayer.getPlayer(ws);
        this.onConnection(player);
        ws.on("message", (message: string) => {
          this.onMessage(player, message);
        });
        ws.on("close", (ws: WebSocket) => {
          this.onClose(player);
        });
      });
    });
  }

  loadConfig(): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile("./resources/config.json", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data.toString()));
        }
      });
    });
  }

  loadWords(): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile("./resources/words.json", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data.toString()));
        }
      });
    });
  }

  onConnection(player: ServerPlayer) {
    console.log(`Player ${player.uuid} has connected!`);
    player.send(signal.UUID, player.uuid);
  }

  onClose(player: ServerPlayer) {
    player.remove();
    console.log(`Player ${player.uuid} has disconnected!`);
  }

  onError(player: ServerPlayer, err) {
    console.log(`Player ${player.uuid} has encountered an error!`, err);
  }

  onMessage(player: ServerPlayer, message: string) {
    try {
      let data = JSON.parse(Buffer.from(message, "base64").toString());
      console.log(`Player ${player.uuid}: `, data);
      let id = player.uuid;

      this.logger.logFromServer(id, data)
      whevent.emit(data.signal, { player, data });
    } catch (ex) {
      console.error(ex);
      console.error(`Player ${player.uuid} unknown package: `, message);
    }
  }

  send(player: ServerPlayer, signal: string, message: object) {
    player.send(signal, message);
  }
}
