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

    whevent.on(signal.LOG, this.logFromPlayer, this);
    whevent.on(signal.LOG_ERROR, this.logErrorFromPlayer, this);

    whevent.on(signal.MATCH, this.onRequestMatch, this);
    whevent.on(signal.MOVE_TO_TABLE, this.moveToTable, this);
    whevent.on(signal.NEXT_TURN, this.nextTurn, this);
    whevent.on(signal.START_GAME, this.onStartGame, this);
    whevent.on(signal.FINISH_LOAD, this.onFinishLoad, this);
    whevent.on(signal.UPDATE_ACTIONS, this.onUpdateActions, this);
    whevent.on(signal.VALIDATE, this.onValidate, this);
    whevent.on(signal.CARD_DRAWN, this.onCardDrawed, this);
    whevent.on(signal.ADD_AN_ITEM, this.onAddItem, this);
    whevent.on(signal.DECLARE_ATTACK, this.onDeclareAttack, this);
    whevent.on(signal.GET_REACTION, this.onGetReaction, this);
    // whevent.on(signal.FIRSTGETREACTION, this.onGetReaction, this);
    whevent.on(signal.RESOLVE_ACTIONS, this.onResolveActions, this);
    whevent.on(signal.DISCARD_LOOT, this.onDiscardLoot, this);
    whevent.on(signal.ACTIVATE_ITEM, this.onActivateItem, this);
    whevent.on(signal.NEW_MONSTER_ON_PLACE, this.onNewActiveMonster, this);
    whevent.on(signal.SHOW_CARD_PREVIEW, this.onShowCardPreview, this);
    whevent.on(signal.ROLL_DICE, this.onRollDice, this);
    whevent.on(signal.ROLL_DICE_ENDED, this.onRollDiceEnded, this);
    whevent.on(signal.GET_NEXT_MONSTER, this.onGetNextMonster, this);
    whevent.on(signal.MOVE_CARD_TO_PILE, this.onMoveCardToPile, this);
    whevent.on(signal.GET_SOUL, this.onGetSoul, this);
    whevent.on(signal.LOSE_SOUL, this.onLoseSoul, this);
    whevent.on(signal.ADD_MONSTER, this.onAddMonster, this);


    //BOARD SIGANL
    whevent.on(signal.REMOVE_MONSTER, this.onRemoveMonster, this);
    whevent.on(signal.DRAW_CARD, this.onDrawCard, this);
    whevent.on(signal.DECK_ADD_TO_TOP, this.onDeckAddToTop, this);
    whevent.on(signal.DECK_ADD_TO_BOTTOM, this.onDeckAddToBottom, this);
    whevent.on(signal.RECHARGE_ITEM, this.onRechargeItem, this);
    whevent.on(signal.USE_ITEM, this.onRotateItem, this);
    whevent.on(signal.SET_TURN, this.onSetTurn, this);
    whevent.on(signal.ASSIGN_CHAR_TO_PLAYER, this.onAssignChar, this);
    whevent.on(signal.FLIP_CARD, this.onFlipCard, this);
    whevent.on(signal.BUY_ITEM_FROM_SHOP, this.onBuyItemFromShop, this);

    whevent.on(signal.UPDATE_PASSIVE_DATA, this.onUpdatePassiveData, this);
    whevent.on(signal.CARD_GET_COUNTER, this.onCardGetCounter, this);
    whevent.on(signal.CANCEL_ATTACK, this.onCancelAttack, this);



    whevent.on(signal.CHANGE_MONEY, this.onChangeMoney, this);
    whevent.on(signal.ADD_STORE_CARD, this.onAddToStoreCard, this);
    whevent.on(signal.REGISTER_PASSIVE_ITEM, this.onRegisterPassive, this);
    whevent.on(signal.UPDATE_PASSIVES_OVER, this.onUpdatePassiveOver, this);
    whevent.on(signal.REGISTER_ONE_TURN_PASSIVE_EFFECT, this.onRegisterOneTurnPassive, this);
    whevent.on(signal.END_ROLL_ACTION, this.onEndRollAction, this);

    //stack events:

    whevent.on(signal.REPLACE_STACK, this.onReplaceStack, this);
    whevent.on(signal.REMOVE_FROM_STACK, this.onRemoveFromStack, this);
    whevent.on(signal.ADD_TO_STACK, this.onAddToStack, this);
    whevent.on(signal.ADD_RESOLVING_STACK_EFFECT, this.onAddToResolvingStack, this);
    whevent.on(signal.REMOVE_RESOLVING_STACK_EFFECT, this.onRemoveFromResolvingStack, this);
    whevent.on(signal.UPDATE_STACK_VIS, this.onUpdateStackVis, this);
    whevent.on(signal.NEXT_STACK_ID, this.onNextStackId, this);
    whevent.on(signal.GIVE_PLAYER_PRIORITY, this.onGivePlayerPriority, this);


    //player events
    whevent.on(signal.SET_MONEY, this.onSetMoney, this);
    whevent.on(signal.PLAYER_GAIN_ATTACK_ROLL_BONUS, this.onPlayerGainAttackRollBonus, this);
    whevent.on(signal.PLAYER_GAIN_DMG, this.onPlayerGainDMG, this);
    whevent.on(signal.PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS, this.onPlayerGainFirstAttackRollBonus, this);
    whevent.on(signal.PLAYER_GAIN_HP, this.onPlayerGainHp, this);
    whevent.on(signal.PLAYER_GAIN_ROLL_BONUS, this.onPlayerGainRollBonus, this);
    whevent.on(signal.PLAYER_GET_HIT, this.onPlayerGetHit, this);
    whevent.on(signal.PLAYER_RECHARGE_ITEM, this.onPlayerRechargeItem, this);
    whevent.on(signal.PLAY_LOOT_CARD, this.onLootCardPlayed, this);
    whevent.on(signal.PLAYER_GET_LOOT, this.onPlayerGainLoot, this);
    whevent.on(signal.PLAYER_LOSE_LOOT, this.onPlayerLoseCard, this);
    whevent.on(signal.PLAYER_HEAL, this.onPlayerHeal, this);
    //

    //monster events
    whevent.on(signal.MONSTER_GAIN_DMG, this.onMonsterGainDMG, this);
    whevent.on(signal.MONSTER_GAIN_HP, this.onMonsterGainHp, this);
    whevent.on(signal.MONSTER_GAIN_ROLL_BONUS, this.onMonsterGainRollBonus, this);
    whevent.on(signal.MONSTER_GET_DAMAGED, this.onMonsterGetDamaged, this);
    whevent.on(signal.MONSTER_HEAL, this.onMonsterHeal, this);
    //

    whevent.on(signal.RESPOND_TO, this.onRespondTo, this);
    whevent.on(signal.FINISH_DO_STACK_EFFECT, this.onFinishDoStackEffect, this);
    whevent.on(signal.DO_STACK_EFFECT, this.onDoStackEffect, this);
    whevent.on(signal.TURN_PLAYER_DO_STACK_EFFECT, this.onTurnPlayerDoStackEffect, this);
    whevent.on(signal.START_TURN, this.onStartTurn, this);

    whevent.on(signal.DECK_ARRAGMENT, this.onDeckArrangement, this);

    whevent.on(signal.MOVE_CARD, this.onCardMove, this);
    whevent.on(signal.MOVE_CARD_END, this.onCardMoveEnd, this);

    //eden events
    whevent.on(signal.EDEN_CHOSEN, this.onEdenChosen, this);
    whevent.on(signal.CHOOSE_FOR_EDEN, this.onChooseForEden, this);

    //Action Lable

    whevent.on(signal.ACTION_MASSAGE, this.onActionMassage, this);

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

  onUpdateActions({ player, data }) {
    player.match.broadcastExept(player, signal.UPDATE_ACTIONS)
  }

  moveToTable({ player, data }) {
    console.log("Move to table request from players");
    player.send(signal.MOVE_TO_TABLE, {
      playerID: player.uuid,
      numOfPlayers: ServerPlayer.players.length
    });
  }

  onEdenChosen({ player, data }) {
    let playerToSendToId: number = data.data.sendToPlayerId
    console.log(playerToSendToId);

    player.match.broadcastToPlayer(playerToSendToId, signal.EDEN_CHOSEN, data)
  }
  onChooseForEden({ player, data }) {
    let playerToSendToId: number = data.data.playerId
    console.log(playerToSendToId);

    player.match.broadcastToPlayer(playerToSendToId, signal.CHOOSE_FOR_EDEN, data)
  }

  onTurnPlayerDoStackEffect({ player, data }) {
    let playerToSendToId: number = data.data.playerId

    player.match.broadcastToPlayer(playerToSendToId, signal.TURN_PLAYER_DO_STACK_EFFECT, data)

  }

  onStartTurn({ player, data }) {
    let playerToSendToId: number = data.data.playerId

    player.match.broadcastToPlayer(playerToSendToId, signal.START_TURN, data)

  }

  onActionMassage({ player, data }) {
    player.match.broadcastExept(player, signal.ACTION_MASSAGE, data)
  }




  //Stack events


  onGetReaction({ player, data }) {
    let playerToSendToId: number = data.data.nextPlayerId
    console.log(playerToSendToId);

    player.match.broadcastToPlayer(playerToSendToId, signal.GET_REACTION, data);
  }

  onFinishDoStackEffect({ player, data }) {

    let playerToSendToId: number = data.data.playerId
    player.match.broadcastToPlayer(playerToSendToId, signal.FINISH_DO_STACK_EFFECT, data);
  }
  onDoStackEffect({ player, data }) {
    let playerToSendToId: number = data.data.playerId
    player.match.broadcastToPlayer(playerToSendToId, signal.DO_STACK_EFFECT, data);
  }

  onUpdateStackVis({ player, data }) {
    player.match.broadcastExept(player, signal.UPDATE_STACK_VIS, data);
  }

  onNextStackId({ player, data }) {
    player.match.broadcastExept(player, signal.NEXT_STACK_ID, data)
  }


  onRespondTo({ player, data }) {
    let playerToSendToId: number = data.data.playerId;
    player.match.broadcastToPlayer(playerToSendToId, signal.RESPOND_TO, data);
  }

  onReplaceStack({ player, data }) {
    player.match.broadcastExept(player, signal.REPLACE_STACK, data);
  }
  onRemoveFromStack({ player, data }) {
    player.match.broadcastExept(player, signal.REMOVE_FROM_STACK, data);
  }

  onAddToStack({ player, data }) {
    player.match.broadcastExept(player, signal.ADD_TO_STACK, data);
  }

  onAddToResolvingStack({ player, data }) {
    player.match.broadcastExept(player, signal.ADD_RESOLVING_STACK_EFFECT, data);
  }
  onRemoveFromResolvingStack({ player, data }) {
    player.match.broadcastExept(player, signal.REMOVE_RESOLVING_STACK_EFFECT, data);
  }


  onGivePlayerPriority({ player, data }) {
    player.match.broadcastExept(player, signal.GIVE_PLAYER_PRIORITY, data);
  }

  //END

  onSetMoney({ player, data }) {
    player.match.broadcastExept(player, signal.SET_MONEY, data);
  }

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

  onCardDrawed({ player, data }) {
    player.match.broadcastExept(player, signal.CARD_DRAWN, data);
  }

  onRegisterPassive({ player, data }) {
    player.match.broadcastExept(player, signal.REGISTER_PASSIVE_ITEM, data);
  }
  onUpdatePassiveOver({ player, data }) {
    player.match.broadcastExept(player, signal.UPDATE_PASSIVES_OVER, data);
  }

  //board events

  onAssignChar({ player, data }) {
    player.match.broadcastExept(player, signal.ASSIGN_CHAR_TO_PLAYER, data);
  }

  onSetTurn({ player, data }) {
    player.match.broadcastExept(player, signal.SET_TURN, data);
  }
  onCancelAttack({ player, data }) {
    player.match.broadcastExept(player, signal.CANCEL_ATTACK, data);
  }

  onCardGetCounter({ player, data }) {
    player.match.broadcastExept(player, signal.CARD_GET_COUNTER, data);
  }

  onEndRollAction({ player, data }) {
    player.match.broadcastExept(player, signal.END_ROLL_ACTION, data);
  }
  onCardMove({ player, data }) {
    player.match.broadcastExept(player, signal.MOVE_CARD, data);
  }
  onCardMoveEnd({ player, data }) {
    let playerToSendToId: number = data.data.playerId
    player.match.broadcastToPlayer(playerToSendToId, signal.MOVE_CARD_END, data);
  }

  onRechargeItem({ player, data }) {
    player.match.broadcastExept(player, signal.RECHARGE_ITEM, data);
  }
  onRotateItem({ player, data }) {
    player.match.broadcastExept(player, signal.USE_ITEM, data);
  }

  onFlipCard({ player, data }) {
    player.match.broadcastExept(player, signal.FLIP_CARD, data);
  }

  onBuyItemFromShop({ player, data }) {
    player.match.broadcastExept(player, signal.BUY_ITEM_FROM_SHOP, data);
  }

  onUpdatePassiveData({ player, data }) {
    player.match.broadcastExept(player, signal.UPDATE_PASSIVE_DATA, data);
  }


  //

  //monster events
  onMonsterGainDMG({ player, data }) {
    player.match.broadcastExept(player, signal.MONSTER_GAIN_DMG, data);
  }
  onMonsterGainHp({ player, data }) {
    player.match.broadcastExept(player, signal.MONSTER_GAIN_HP, data);
  }
  onMonsterGainRollBonus({ player, data }) {
    player.match.broadcastExept(player, signal.MONSTER_GAIN_ROLL_BONUS, data);
  }
  onMonsterGetDamaged({ player, data }) {
    player.match.broadcastExept(player, signal.MONSTER_GET_DAMAGED, data);
  }


  onMonsterHeal({ player, data }) {
    player.match.broadcastExept(player, signal.MONSTER_HEAL, data);
  }

  //monster events end


  //player events

  onPlayerHeal({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYER_HEAL, data);
  }

  onPlayerGainLoot({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYER_GET_LOOT, data);
  }

  onPlayerGainAttackRollBonus({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYER_GAIN_ATTACK_ROLL_BONUS, data);
  }
  onPlayerGainDMG({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYER_GAIN_DMG, data);
  }
  onPlayerGainFirstAttackRollBonus({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS, data);
  }
  onPlayerGainHp({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYER_GAIN_HP, data);
  }
  onPlayerGainRollBonus({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYER_GAIN_ROLL_BONUS, data);
  }
  onPlayerGetHit({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYER_GET_HIT, data);
  }
  onPlayerRechargeItem({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYER_RECHARGE_ITEM, data);
  }

  onPlayerLoseCard({ player, data }) {
    player.match.broadcastExept(player, signal.PLAYER_LOSE_LOOT, data);
  }



  //player events end

  //deck events start

  onAddToStoreCard({ player, data }) {
    player.match.broadcastExept(player, signal.ADD_STORE_CARD, data);
  }

  onRegisterOneTurnPassive({ player, data }) {
    player.match.broadcastExept(player, signal.REGISTER_ONE_TURN_PASSIVE_EFFECT, data);
  }

  onDeckAddToTop({ player, data }) {
    player.match.broadcastExept(player, signal.DECK_ADD_TO_TOP, data);
  }

  onDeckAddToBottom({ player, data }) {
    player.match.broadcastExept(player, signal.DECK_ADD_TO_BOTTOM, data);
  }


  onDeckArrangement({ player, data }) {
    player.match.broadcastExept(player, signal.DECK_ARRAGMENT, data)
  }


  //


  onChangeMoney({ player, data }) {
    player.match.broadcastExept(player, signal.CHANGE_MONEY, data);
  }


  onDrawCard({ player, data }) {
    player.match.broadcastExept(player, signal.DRAW_CARD, data);
  }


  onGetSoul({ player, data }) {
    player.match.broadcastExept(player, signal.GET_SOUL, data);
  }

  onLoseSoul({ player, data }) {
    player.match.broadcastExept(player, signal.LOSE_SOUL, data);
  }

  onRemoveMonster({ player, data }) {
    player.match.broadcastExept(player, signal.REMOVE_MONSTER, data);
  }
  onAddMonster({ player, data }) {
    player.match.broadcastExept(player, signal.ADD_MONSTER, data);
  }


  onRollDiceEnded({ player, data }) {
    player.match.broadcastExept(player, signal.ROLL_DICE_ENDED, data);
  }

  onGetNextMonster({ player, data }) {
    player.match.broadcastExept(player, signal.GET_NEXT_MONSTER, data);
  }
  onMoveCardToPile({ player, data }) {
    player.match.broadcastExept(player, signal.MOVE_CARD_TO_PILE, data);
  }

  onRollDice({ player, data }) {
    player.match.broadcastExept(player, signal.ROLL_DICE, data);
  }

  onShowCardPreview({ player, data }) {
    player.match.broadcastExept(player, signal.SHOW_CARD_PREVIEW, data);
  }

  onNewActiveMonster({ player, data }) {
    player.match.broadcastExept(player, signal.NEW_MONSTER_ON_PLACE, data);
  }

  onActivateItem({ player, data }) {
    player.match.broadcastExept(player, signal.ACTIVATE_ITEM, data);
  }

  onDeclareAttack({ player, data }) {
    player.match.broadcastExept(player, signal.DECLARE_ATTACK, data);
  }

  onLootCardPlayed({ player, data }) {
    player.match.broadcastExept(player, signal.PLAY_LOOT_CARD, data);
  }

  onDiscardLoot({ player, data }) {
    player.match.broadcastExept(player, signal.DISCARD_LOOT, data);
  }

  onAddItem({ player, data }) {
    player.match.broadcastExept(player, signal.ADD_AN_ITEM, data);
  }

  nextTurn({ player, data }) {
    player.match.broadcastExept(player, signal.NEXT_TURN, data);
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
