/**
 * Communicate with server.
 * @author wheatup
 */
import Events from "../Misc/Events";
import Config from "./Config";

import Signal from "../Misc/Signal";
import ActionManager from "../Script/Managers/ActionManager";
import Player from "../Script/Entites/GameEntities/Player";
import MainScript from "../Script/MainScript";
import { Logger } from "../Script/Entites/Logger";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ServerClient extends cc.Component {
  static $: ServerClient = null;
  static players: Player[] = [];
  static numOfPlayers: number = null;
  @property(WebSocket)
  ws: WebSocket = null;
  pid: number = 0;
  reactionCounter = 0;

  onLoad() {
    ServerClient.$ = this;

    whevent.on(Events.MULTIPLAYER, this.connect, this);

    whevent.on(Signal.MOVE_TO_TABLE, this.onMoveToTable, this);
    whevent.on(Signal.NEXT_TURN, this.onPlayerActionFromServer, this);
    whevent.on(Signal.UUID, this.onUUID, this);
    whevent.on(Signal.JOIN, this.onJoin, this);
    whevent.on(Signal.START_GAME, this.onStartGame, this);
    whevent.on(Signal.LEAVE, this.onLeave, this);
    whevent.on(Signal.FINISH_LOAD, this.onFinishLoad, this);
    whevent.on(Signal.UPDATE_ACTIONS, this.onUpdateActions, this);
    whevent.on(Signal.PLAY_LOOT_CARD, this.onPlayerActionFromServer, this);
    whevent.on(Signal.DECLARE_ATTACK, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ADD_AN_ITEM, this.onPlayerActionFromServer, this);
    whevent.on(Signal.GET_REACTION, this.onPlayerActionFromServer, this);
    whevent.on(Signal.FIRST_GET_REACTION, this.onPlayerActionFromServer, this);
    whevent.on(Signal.END_ROLL_ACTION, this.onPlayerActionFromServer, this);
    whevent.on(Signal.RESOLVE_ACTIONS, this.onPlayerActionFromServer, this);
    whevent.on(
      Signal.OTHER_PLAYER_RESOLVE_REACTION,
      this.onPlayerActionFromServer,
      this
    );
    whevent.on(Signal.DISCARD_LOOT, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ACTIVATE_ITEM, this.onPlayerActionFromServer, this);

    whevent.on(Signal.SHOW_CARD_PREVIEW, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ROLL_DICE, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ROLL_DICE_ENDED, this.onPlayerActionFromServer, this);

    whevent.on(Signal.MOVE_CARD_TO_PILE, this.onPlayerActionFromServer, this);

    whevent.on(Signal.REMOVE_MONSTER, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ADD_MONSTER, this.onPlayerActionFromServer, this);
    whevent.on(Signal.DRAW_CARD, this.onPlayerActionFromServer, this);
    whevent.on(Signal.FIRST_GET_REACTION, this.onPlayerActionFromServer, this);
    whevent.on(Signal.CHANGE_MONEY, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ADD_STORE_CARD, this.onPlayerActionFromServer, this);
    whevent.on(Signal.UPDATE_PASSIVES_OVER, this.onPlayerActionFromServer, this);
    whevent.on(Signal.REGISTER_PASSIVE_ITEM, this.onPlayerActionFromServer, this);
    whevent.on(Signal.REGISTER_ONE_TURN_PASSIVE_EFFECT, this.onPlayerActionFromServer, this);
    whevent.on(Signal.SET_MONEY, this.onPlayerActionFromServer, this);

    //player events
    whevent.on(Signal.GET_SOUL, this.onPlayerActionFromServer, this);
    whevent.on(Signal.LOSE_SOUL, this.onPlayerActionFromServer, this);
    whevent.on(Signal.PLAYER_GAIN_ATTACK_ROLL_BONUS, this.onPlayerActionFromServer, this);
    whevent.on(Signal.PLAYER_GAIN_DMG, this.onPlayerActionFromServer, this);
    whevent.on(Signal.PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS, this.onPlayerActionFromServer, this);
    whevent.on(Signal.PLAYER_GAIN_HP, this.onPlayerActionFromServer, this);
    whevent.on(Signal.PLAYER_GAIN_ROLL_BONUS, this.onPlayerActionFromServer, this);
    whevent.on(Signal.PLAYER_GET_HIT, this.onPlayerActionFromServer, this);
    whevent.on(Signal.PLAYER_RECHARGE_ITEM, this.onPlayerActionFromServer, this);
    whevent.on(Signal.PLAY_LOOT_CARD, this.onPlayerActionFromServer, this);
    whevent.on(Signal.PLAYER_GET_LOOT, this.onPlayerActionFromServer, this);
    whevent.on(Signal.PLAYER_LOSE_LOOT, this.onPlayerActionFromServer, this);
    whevent.on(Signal.RESPOND_TO, this.onPlayerActionFromServer, this);
    whevent.on(Signal.DO_STACK_EFFECT, this.onPlayerActionFromServer, this);
    whevent.on(Signal.FINISH_DO_STACK_EFFECT, this.onPlayerActionFromServer, this);
    whevent.on(Signal.GIVE_PLAYER_PRIORITY, this.onPlayerActionFromServer, this);
    whevent.on(Signal.TURN_PLAYER_DO_STACK_EFFECT, this.onPlayerActionFromServer, this);
    whevent.on(Signal.START_TURN, this.onPlayerActionFromServer, this);
    whevent.on(Signal.PLAYER_HEAL, this.onPlayerActionFromServer, this);


    //monster events
    whevent.on(Signal.MONSTER_GAIN_DMG, this.onPlayerActionFromServer, this);
    whevent.on(Signal.MONSTER_GAIN_HP, this.onPlayerActionFromServer, this);
    whevent.on(Signal.MONSTER_GAIN_ROLL_BONUS, this.onPlayerActionFromServer, this);
    whevent.on(Signal.MONSTER_GET_DAMAGED, this.onPlayerActionFromServer, this);
    whevent.on(Signal.MONSTER_HEAL, this.onPlayerActionFromServer, this);


    //board events
    whevent.on(Signal.MOVE_CARD, this.onPlayerActionFromServer, this);
    whevent.on(Signal.MOVE_CARD_END, this.onPlayerActionFromServer, this);
    whevent.on(Signal.NEW_MONSTER_ON_PLACE, this.onPlayerActionFromServer, this);
    whevent.on(Signal.GET_NEXT_MONSTER, this.onPlayerActionFromServer, this);
    whevent.on(Signal.RECHARGE_ITEM, this.onPlayerActionFromServer, this);
    whevent.on(Signal.USE_ITEM, this.onPlayerActionFromServer, this);
    whevent.on(Signal.SET_TURN, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ASSIGN_CHAR_TO_PLAYER, this.onPlayerActionFromServer, this);
    whevent.on(Signal.FLIP_CARD, this.onPlayerActionFromServer, this);
    whevent.on(Signal.BUY_ITEM_FROM_SHOP, this.onPlayerActionFromServer, this);
    whevent.on(Signal.CARD_GET_COUNTER, this.onPlayerActionFromServer, this);
    whevent.on(Signal.NEW_MONSTER_PLACE, this.onPlayerActionFromServer, this);




    whevent.on(Signal.UPDATE_PASSIVE_DATA, this.onPlayerActionFromServer, this);

    //deck event
    whevent.on(Signal.DECK_ADD_TO_TOP, this.onPlayerActionFromServer, this);
    whevent.on(Signal.DECK_ADD_TO_BOTTOM, this.onPlayerActionFromServer, this);
    whevent.on(Signal.CARD_DRAWN, this.onPlayerActionFromServer, this);
    whevent.on(Signal.DECK_ARRAGMENT, this.onPlayerActionFromServer, this);

    //stack events
    whevent.on(Signal.REPLACE_STACK, this.onPlayerActionFromServer, this);
    whevent.on(Signal.REMOVE_FROM_STACK, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ADD_TO_STACK, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ADD_RESOLVING_STACK_EFFECT, this.onPlayerActionFromServer, this);
    whevent.on(Signal.REMOVE_RESOLVING_STACK_EFFECT, this.onPlayerActionFromServer, this);
    whevent.on(Signal.UPDATE_STACK_VIS, this.onPlayerActionFromServer, this);
    whevent.on(Signal.NEXT_STACK_ID, this.onPlayerActionFromServer, this);

    //Eden events
    whevent.on(Signal.EDEN_CHOSEN, this.onPlayerActionFromServer, this);
    whevent.on(Signal.CHOOSE_FOR_EDEN, this.onPlayerActionFromServer, this);

    //Action Lable
    whevent.on(Signal.ACTION_MASSAGE, this.onPlayerActionFromServer, this);
  }



  onPlayerActionFromServer({ signal, data }) {
    ActionManager.getActionFromServer(signal, data);
  }

  onMoveToTable({ playerID, numOfPlayers }) {
    this.pid = playerID;
    ServerClient.numOfPlayers = numOfPlayers;
    cc.log("Server num of players is " + ServerClient.numOfPlayers);
    cc.director.loadScene("MainGame");
  }

  onFinishLoad({ id }) {
    cc.log('on finish load')
    MainScript.makeFirstUpdateActions(id)
  }

  async onUpdateActions() {
    cc.log('update actions from server')
    await ActionManager.updateActions()
  }

  onDestroy() {
    whevent.off(Events.MULTIPLAYER, this.connect, this);
    whevent.off(Signal.JOIN, this.onJoin, this);
    whevent.off(Signal.START_GAME, this.onStartGame, this);
    whevent.off(Signal.LEAVE, this.onLeave, this);
  }

  connect() {
    //	whevent.emit(Events.TIP, {message: 'Connecting...', time: 0});
    if (this.ws == null) {
      let serverLable = cc.find('Canvas/ServerIP').getComponent(cc.EditBox)
      let serverIp = "ws://" + serverLable.string + ':2333';

      this.ws = new WebSocket(serverIp);

    }

    let onOpen = this.onOpen.bind(this);
    let onMessage = this.onMessage.bind(this);
    let onClose = this.onClose.bind(this);

    this.ws.onopen = onOpen;
    this.ws.onmessage = onMessage;
    this.ws.onclose = onClose;

    // this.ws.addEventListener("open", this.onOpen.bind(this));
    // this.ws.addEventListener("message", this.onMessage.bind(this));
    // this.ws.addEventListener("close", this.onClose.bind(this));
  }

  onOpen() {
    cc.log("Connected to the server!");
    cc.find(`Canvas/Server Connection`).getComponent(cc.Label).string = 'Connected to the Server'
  }

  onClose() {
    cc.log("Disconnected from the server!");
    this.ws.close();
    this.ws.removeEventListener("open", this.onOpen.bind(this));
    this.ws.removeEventListener("message", this.onMessage.bind(this));
    this.ws.removeEventListener("close", this.onClose.bind(this));
    whevent.emit(Events.LOST_CONNECTION);
  }

  onMessage({ data }) {
    let pack = JSON.parse(atob(data));
    whevent.emit(pack.signal, pack.data);
    if (
      pack.signal == Signal.REACTION ||
      pack.signal == Signal.FIRST_GET_REACTION
    ) {
      cc.log(++this.reactionCounter);
    }
    //cc.log('%cRECEIVE:', 'color:#4A3;', pack.signal, pack.data);
  }

  send(signal: string, data?: any) {
    if (signal == Signal.REACTION || signal == Signal.FIRST_GET_REACTION) {
      //cc.log(this.reactionCounter);
    }
    let time = new Date().toTimeString().substring(0, 8)
    Logger.printMethodSignal([signal, data], true)
    // cc.log("%cSENDING:", "color:#36F;", signal, time);
    // cc.log(data)
    this.ws.send(btoa(JSON.stringify({ signal, data })));
  }

  onUUID(uuid: number) {
    let player: Player = new Player();
    player.playerId = uuid;
  }

  onJoin(uuid) {
    cc.log(uuid);
    let lable = cc.find(`Canvas/Match Players`).getComponent(cc.Label)
    let string = lable.string + `\nPlayer ${uuid.uuid}`;

    cc.find(`Canvas/Match Players`).getComponent(cc.Label).string = string
  }

  onStartGame({ }) {
    cc.game.addPersistRootNode(this.node);

    ServerClient.$.send(Signal.MOVE_TO_TABLE);
    //  cc.director.loadScene("MainGame");
  }

  onLeave(uuid: number) {
    whevent.emit(Events.TIP, { message: "Your Opponent has left!" });
  }
}
