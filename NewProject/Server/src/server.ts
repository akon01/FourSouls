/**
 * Server
 * @author wheatup
 */

import WebSocket, { Server as WebSocketServer } from "ws";
import ServerPlayer from "./entities/player";
import Signal from "./enums/signal";
import * as whevent from "whevent";
import * as fs from "fs";
import signal from "./enums/signal";
import Match from "./entities/match";
declare const Buffer;

export default class Server {
  static $: Server = null;

  wss: WebSocketServer = null;
  config: any = null;
  words: string[] = [];

  constructor() {
    Server.$ = this;
  }

  async init() {
    console.log("Loading config...");
    this.config = await this.loadConfig();
    console.log("Loading dictionary...");
    this.words = await this.loadWords();
    console.log("Setting up server...");
    this.setupWebSocket();
    this.bindEvents();
  }

  bindEvents() {
    whevent.on(signal.MATCH, this.onRequestMatch, this);
    whevent.on(signal.MOVETOTABLE, this.moveToTable, this);
    whevent.on(signal.NEXTTURN, this.nextTurn, this);
    whevent.on(signal.STARTGAME, this.onStartGame, this);
    whevent.on(signal.FINISHLOAD, this.onFinishLoad, this);
    whevent.on(signal.UPDATEACTIONS, this.onUpdateActions, this);
    whevent.on(signal.VALIDATE, this.onValidate, this);
    whevent.on(signal.CARDDRAWED, this.onCardDrawed, this);
    whevent.on(signal.ADDANITEM, this.onAddItem, this);
    whevent.on(signal.DECLAREATTACK, this.onDeclareAttack, this);
    whevent.on(signal.PLAYLOOTCARD, this.onLootCardPlayed, this);
    whevent.on(Signal.GETREACTION, this.onGetReaction, this);
    whevent.on(Signal.FIRSTGETREACTION, this.onGetReaction, this);
    whevent.on(Signal.RESOLVEACTIONS, this.onResolveActions, this);
    whevent.on(signal.DISCRADLOOT, this.onDiscardLoot, this);
    whevent.on(signal.ACTIVATEITEM, this.onActivateItem, this);
    whevent.on(signal.NEWMONSTERONPLACE, this.onNewActiveMonster, this);
    whevent.on(signal.SHOWCARDPREVIEW, this.onShowCardPreview, this);
    whevent.on(signal.ROLLDICE, this.onRollDice, this);
    whevent.on(signal.ROLLDICEENDED, this.onRollDiceEnded, this);
    whevent.on(signal.GETNEXTMONSTER, this.onGetNextMonster, this);
    whevent.on(signal.MOVECARDTOPILE, this.onMoveCardToPile, this);
    whevent.on(signal.GETSOUL, this.onGetSoul, this);
    whevent.on(signal.ADDMONSTER, this.onAddMonster, this);


    whevent.on(signal.REMOVEMONSTER, this.onRemoveMonster, this);
    whevent.on(signal.DRAWCARD, this.onDrawCard, this);
    whevent.on(signal.DECKADDTOTOP, this.onDeckAddToTop, this);


    whevent.on(signal.CHANGEMONEY, this.onChangeMoney, this);
    whevent.on(signal.ADDSTORECARD, this.onAddToStoreCard, this);
    whevent.on(signal.REGISTERPASSIVEITEM, this.onRegisterPassive, this);
    whevent.on(signal.UPDATEPASSIVESOVER, this.onUpdatePassiveOver, this);
    whevent.on(signal.REGISTERONETURNPASSIVEEFFECT, this.onRegisterOneTurnPassive, this);
    whevent.on(signal.ENDROLLACTION, this.onEndRollAction, this);



    whevent.on(signal.SETMONEY, this.onSetMoney, this);
    whevent.on(Signal.PLAYERGAINATTACKROLLBONUS, this.onPlayerGainAttackRollBonus, this);
    whevent.on(Signal.PLAYERGAINDMG, this.onPlayerGainDMG, this);
    whevent.on(Signal.PLAYERGAINFIRSTATTACKROLLBONUS, this.onPlayerGainFirstAttackRollBonus, this);
    whevent.on(Signal.PLAYERGAINHP, this.onPlayerGainHp, this);
    whevent.on(Signal.PLAYERGAINROLLBONUS, this.onPlayerGainRollBonus, this);
    whevent.on(Signal.PLAYERGETHIT, this.onPlayerGetHit, this);
    whevent.on(Signal.PLAYERRECHARGEITEM, this.onPlayerRechargeItem, this);
    whevent.on(Signal.PLAYLOOTCARD, this.onPlayerLoseCard, this);

    whevent.on(Signal.MONSTERGAINDMG, this.onMonsterGainDMG, this);
    whevent.on(Signal.MONSTERGAINHP, this.onMonsterGainHp, this);
    whevent.on(Signal.MONSTERGAINROLLBONUS, this.onMonsterGainRollBonus, this);
    whevent.on(Signal.MONSTERGETDAMAGED, this.onMonsterGetDamaged, this);


    whevent.on(Signal.MOVECARD, this.onCardMove, this);
    whevent.on(Signal.MOVECARDEND, this.onCardMoveEnd, this);
  }





  onRequestMatch({ player, data }) {
    if (ServerPlayer.players.length >= 2) {
      let match = Match.getMatch();
      match.join(player);
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
      player.match.broadcast(signal.FINISHLOAD, { id: player.match.firstPlayerId })
    }
  }

  onUpdateActions({ player, data }) {
    player.send(signal.UPDATEACTIONS)
  }

  moveToTable({ player, data }) {
    console.log("Move to table request from players");
    player.send(signal.MOVETOTABLE, {
      playerID: player.uuid,
      numOfPlayers: ServerPlayer.players.length
    });
  }

  onGetReaction({ player, data }) {
    player.match.broadcastToNextPlayer(player, signal.GETREACTION, data);
  }
  onSetMoney({ player, data }) {
    player.match.broadcastExept(player, signal.SETMONEY, data);
  }

  onResolveActions({ player, data }) {
    let firstPlayer = player.match.getPlayerById(data.data.originalPlayer);

    firstPlayer.send(signal.RESOLVEACTIONS, data);
    player.match.broadcastExept(
      firstPlayer,
      signal.OTHERPLAYERRESOLVEREACTION,
      data
    );
    //add broadcast to other players with diffrent signal to exceute "other side action stack"
  }

  onCardDrawed({ player, data }) {
    player.match.broadcastExept(player, signal.CARDDRAWED, data);
  }

  onRegisterPassive({ player, data }) {
    player.match.broadcastExept(player, signal.REGISTERPASSIVEITEM, data);
  }
  onUpdatePassiveOver({ player, data }) {
    player.match.broadcastExept(player, signal.UPDATEPASSIVESOVER, data);
  }

  //board events

  onEndRollAction({ player, data }) {
    player.match.broadcastExept(player, signal.ENDROLLACTION, data);
  }
  onCardMove({ player, data }) {
    player.match.broadcastExept(player, signal.MOVECARD, data);
  }
  onCardMoveEnd({ player, data }) {
    player.match.broadcastExept(player, signal.MOVECARDEND, data);
  }


  //monster events
  onMonsterGainDMG({ player, data }) {
    player.match.broadcastExept(player, signal.MONSTERGAINDMG, data);
  }
  onMonsterGainHp({ player, data }) {
    player.match.broadcastExept(player, signal.MONSTERGAINHP, data);
  }
  onMonsterGainRollBonus({ player, data }) {
    player.match.broadcastExept(player, signal.MONSTERGAINROLLBONUS, data);
  }
  onMonsterGetDamaged({ player, data }) {
    player.match.broadcastExept(player, signal.MONSTERGETDAMAGED, data);
  }


  //monster events end


  //player events

  onPlayerGainAttackRollBonus({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYERGAINATTACKROLLBONUS, data);
  }
  onPlayerGainDMG({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYERGAINDMG, data);
  }
  onPlayerGainFirstAttackRollBonus({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYERGAINFIRSTATTACKROLLBONUS, data);
  }
  onPlayerGainHp({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYERGAINHP, data);
  }
  onPlayerGainRollBonus({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYERGAINROLLBONUS, data);
  }
  onPlayerGetHit({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYERGETHIT, data);
  }
  onPlayerRechargeItem({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYERRECHARGEITEM, data);
  }

  onPlayerLoseCard({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYLOOTCARD, data);
  }


  //player events end

  //deck events start

  onAddToStoreCard({ player, data }) {
    player.match.broadcastExept(player, signal.ADDSTORECARD, data);
  }

  onRegisterOneTurnPassive({ player, data }) {
    player.match.broadcastExept(player, signal.REGISTERONETURNPASSIVEEFFECT, data);
  }

  onDeckAddToTop({ player, data }) {
    player.match.broadcastExept(player, signal.DECKADDTOTOP, data);
  }



  onChangeMoney({ player, data }) {
    player.match.broadcastExept(player, signal.CHANGEMONEY, data);
  }


  onDrawCard({ player, data }) {
    player.match.broadcastExept(player, signal.DRAWCARD, data);
  }


  onGetSoul({ player, data }) {
    player.match.broadcastExept(player, signal.GETSOUL, data);
  }

  onRemoveMonster({ player, data }) {
    player.match.broadcastExept(player, signal.REMOVEMONSTER, data);
  }
  onAddMonster({ player, data }) {
    player.match.broadcastExept(player, signal.ADDMONSTER, data);
  }


  onRollDiceEnded({ player, data }) {
    player.match.broadcastExept(player, signal.ROLLDICEENDED, data);
  }

  onGetNextMonster({ player, data }) {
    player.match.broadcastExept(player, signal.GETNEXTMONSTER, data);
  }
  onMoveCardToPile({ player, data }) {
    player.match.broadcastExept(player, signal.MOVECARDTOPILE, data);
  }

  onRollDice({ player, data }) {
    player.match.broadcastExept(player, signal.ROLLDICE, data);
  }

  onShowCardPreview({ player, data }) {
    player.match.broadcastExept(player, signal.SHOWCARDPREVIEW, data);
  }

  onNewActiveMonster({ player, data }) {
    player.match.broadcastExept(player, signal.NEWMONSTERONPLACE, data);
  }

  onActivateItem({ player, data }) {
    player.match.broadcastExept(player, signal.ACTIVATEITEM, data);
  }

  onDeclareAttack({ player, data }) {
    player.match.broadcastExept(player, signal.DECLAREATTACK, data);
  }

  onLootCardPlayed({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYLOOTCARD, data);
  }

  onDiscardLoot({ player, data }) {
    player.match.broadcastExept(player, signal.DISCRADLOOT, data);
  }

  onAddItem({ player, data }) {
    player.match.broadcastExept(player, signal.ADDANITEM, data);
  }

  nextTurn({ player, data }) {
    player.match.broadcastExept(player, signal.NEXTTURN, data);
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
    player.send(Signal.UUID, player.uuid);
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
