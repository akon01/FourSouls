/**
 * Communicate with server.
 * @author wheatup
 */
import Events from "../Misc/Events";
import Config from "./Config";

import Signal from "../Misc/Signal";
import Player from "../Script/Entites/GameEntities/Player";
import { Logger } from "../Script/Entites/Logger";
import MainScript from "../Script/MainScript";
import ActionManager from "../Script/Managers/ActionManager";
import { whevent } from "./whevent";
import AnnouncementLable from "../Script/LableScripts/Announcement Lable";


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

    whevent.on(Signal.PLAYER_DISCONNECTED, this.showPlayerDisconnected, this);

    whevent.on(Signal.MOVE_TO_TABLE, this.onMoveToTable, this);
    whevent.on(Signal.NEXT_TURN, this.onPlayerActionFromServer, this);
    whevent.on(Signal.END_GAME, this.onPlayerActionFromServer, this);
    whevent.on(Signal.GAME_HAS_STARTED, this.onPlayerActionFromServer, this);
    whevent.on(Signal.END_TURN, this.onPlayerActionFromServer, this);

    whevent.on(Signal.UUID, this.onUUID, this);
    whevent.on(Signal.JOIN, this.onJoin, this);
    whevent.on(Signal.START_GAME, this.onStartGame, this);
    whevent.on(Signal.LEAVE, this.onLeave, this);
    whevent.on(Signal.FINISH_LOAD, this.onFinishLoad, this);
    whevent.on(Signal.UPDATE_ACTIONS, this.onUpdateActions, this);

    whevent.on(Signal.CARD_ADD_TRINKET, this.onPlayerActionFromServer, this)

    whevent.on(Signal.ACTIVATE_PARTICLE_EFFECT, this.onPlayerActionFromServer, this)
    whevent.on(Signal.DISABLE_PARTICLE_EFFECT, this.onPlayerActionFromServer, this)

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
    whevent.on(Signal.REMOVE_FROM_PILE, this.onPlayerActionFromServer, this);

    whevent.on(Signal.REMOVE_MONSTER, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ADD_MONSTER, this.onPlayerActionFromServer, this);
    whevent.on(Signal.DRAW_CARD, this.onPlayerActionFromServer, this);
    whevent.on(Signal.FIRST_GET_REACTION, this.onPlayerActionFromServer, this);
    whevent.on(Signal.CHANGE_MONEY, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ADD_STORE_CARD, this.onPlayerActionFromServer, this);
    whevent.on(Signal.SET_MAX_ITEMS_STORE, this.onPlayerActionFromServer, this);
    whevent.on(Signal.UPDATE_PASSIVES_OVER, this.onPlayerActionFromServer, this);
    whevent.on(Signal.REGISTER_PASSIVE_ITEM, this.onPlayerActionFromServer, this);
    whevent.on(Signal.REMOVE_FROM_PASSIVE_MANAGER, this.onPlayerActionFromServer, this);
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
    whevent.on(Signal.PLAYER_DIED, this.onPlayerActionFromServer, this);
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
    whevent.on(Signal.PLAYER_ADD_DMG_PREVENTION, this.onPlayerActionFromServer, this);
    whevent.on(Signal.PLAYER_DIED, this.onPlayerActionFromServer, this);

    //monster events
    whevent.on(Signal.MONSTER_GAIN_DMG, this.onPlayerActionFromServer, this);
    whevent.on(Signal.MONSTER_GAIN_HP, this.onPlayerActionFromServer, this);
    whevent.on(Signal.MONSTER_GAIN_ROLL_BONUS, this.onPlayerActionFromServer, this);
    whevent.on(Signal.MONSTER_GET_DAMAGED, this.onPlayerActionFromServer, this);
    whevent.on(Signal.MONSTER_HEAL, this.onPlayerActionFromServer, this);
    whevent.on(Signal.MONSTER_ADD_DMG_PREVENTION, this.onPlayerActionFromServer, this);

    //board events
    whevent.on(Signal.MOVE_CARD, this.onPlayerActionFromServer, this);
    whevent.on(Signal.MOVE_CARD_END, this.onPlayerActionFromServer, this);
    whevent.on(Signal.SOUL_CARD_MOVE_END, this.onPlayerActionFromServer, this);
    whevent.on(Signal.NEW_MONSTER_ON_PLACE, this.onPlayerActionFromServer, this);
    whevent.on(Signal.GET_NEXT_MONSTER, this.onPlayerActionFromServer, this);
    whevent.on(Signal.RECHARGE_ITEM, this.onPlayerActionFromServer, this);
    whevent.on(Signal.USE_ITEM, this.onPlayerActionFromServer, this);
    whevent.on(Signal.SET_TURN, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ASSIGN_CHAR_TO_PLAYER, this.onPlayerActionFromServer, this);
    whevent.on(Signal.SET_CHAR, this.onPlayerActionFromServer, this);
    whevent.on(Signal.SET_CHAR_END, this.onPlayerActionFromServer, this);
    whevent.on(Signal.FLIP_CARD, this.onPlayerActionFromServer, this);
    whevent.on(Signal.REMOVE_ITEM_FROM_SHOP, this.onPlayerActionFromServer, this);
    whevent.on(Signal.CARD_GET_COUNTER, this.onPlayerActionFromServer, this);
    whevent.on(Signal.NEW_MONSTER_PLACE, this.onPlayerActionFromServer, this);
    whevent.on(Signal.END_BATTLE, this.onPlayerActionFromServer, this)
    whevent.on(Signal.UPDATE_PASSIVE_DATA, this.onPlayerActionFromServer, this);
    whevent.on(Signal.SHOW_DECISION, this.onPlayerActionFromServer, this);
    whevent.on(Signal.SHOW_STACK_EFFECT, this.onPlayerActionFromServer, this);
    whevent.on(Signal.SET_STACK_ICON, this.onPlayerActionFromServer, this);
    whevent.on(Signal.SHOW_DICE_ROLL, this.onPlayerActionFromServer, this);
    whevent.on(Signal.SHOW_EFFECT_CHOSEN, this.onPlayerActionFromServer, this);
    whevent.on(Signal.SHOW_REACTIONS, this.onPlayerActionFromServer, this);
    whevent.on(Signal.HIDE_REACTIONS, this.onPlayerActionFromServer, this);
    whevent.on(Signal.REACTION_TOGGLED, this.onPlayerActionFromServer, this);

    //deck event
    whevent.on(Signal.DECK_ADD_TO_TOP, this.onPlayerActionFromServer, this);
    whevent.on(Signal.DECK_ADD_TO_BOTTOM, this.onPlayerActionFromServer, this);
    whevent.on(Signal.CARD_DRAWN, this.onPlayerActionFromServer, this);
    whevent.on(Signal.DECK_ARRAGMENT, this.onPlayerActionFromServer, this);

    //stack events
    whevent.on(Signal.REPLACE_STACK, this.onPlayerActionFromServer, this);
    whevent.on(Signal.REMOVE_FROM_STACK, this.onPlayerActionFromServer, this);
    whevent.on(Signal.STACK_EMPTIED, this.onPlayerActionFromServer, this);
    whevent.on(Signal.FIZZLE_STACK_EFFECT, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ADD_TO_STACK, this.onPlayerActionFromServer, this);
    whevent.on(Signal.PUT_ON_STACK, this.onPlayerActionFromServer, this);
    whevent.on(Signal.END_PUT_ON_STACK, this.onPlayerActionFromServer, this);
    whevent.on(Signal.UPDATE_RESOLVING_STACK_EFFECTS, this.onPlayerActionFromServer, this);
    whevent.on(Signal.UPDATE_STACK_VIS, this.onPlayerActionFromServer, this);
    whevent.on(Signal.NEXT_STACK_ID, this.onPlayerActionFromServer, this);
    whevent.on(Signal.UPDATE_STACK_LABLE, this.onPlayerActionFromServer, this);
    whevent.on(Signal.STACK_EFFECT_LABLE_CHANGE, this.onPlayerActionFromServer, this);
    whevent.on(Signal.ADD_SE_VIS_PREV, this.onPlayerActionFromServer, this);
    whevent.on(Signal.REMOVE_SE_VIS_PREV, this.onPlayerActionFromServer, this);
    whevent.on(Signal.CLEAR_SE_VIS, this.onPlayerActionFromServer, this);
    whevent.on(Signal.UPDATE_STACK_EFFECT, this.onPlayerActionFromServer, this);

    //Eden events
    whevent.on(Signal.EDEN_CHOSEN, this.onPlayerActionFromServer, this);
    whevent.on(Signal.CHOOSE_FOR_EDEN, this.onPlayerActionFromServer, this);

    //Action Lable

    whevent.on(Signal.ACTION_MASSAGE_REMOVE, this.onPlayerActionFromServer, this);

    //Signle Card Evenets
    whevent.on(Signal.SET_CONCURENT_EFFECT_DATA, this.onPlayerActionFromServer, this);

    //Announcement Lable
    whevent.on(Signal.SHOW_ANNOUNCEMENT, this.onPlayerActionFromServer, this);
    whevent.on(Signal.HIDE_ANNOUNCEMENT, this.onPlayerActionFromServer, this);

    whevent.on(Signal.SHOW_TIMER, this.onPlayerActionFromServer, this);
    whevent.on(Signal.HIDE_TIMER, this.onPlayerActionFromServer, this);
  }


  showPlayerDisconnected(data: { signal, text }) {
    AnnouncementLable.$.showAnnouncement(data.text, 3, false)
  }



  onPlayerActionFromServer(data: { signal, data }) {
    // tslint:disable-next-line: no-floating-promises
    ActionManager.getActionFromServer(data.signal, data.data);
  }

  onMoveToTable({ playerID, numOfPlayers }) {
    this.pid = playerID;
    ServerClient.numOfPlayers = numOfPlayers;
    cc.log("Server num of players is " + ServerClient.numOfPlayers);
    cc.director.loadScene("MainGame");
  }

  onFinishLoad({ id }) {
    cc.log("on finish load")
    // tslint:disable-next-line: no-floating-promises
    MainScript.makeFirstUpdateActions(id)
  }

  async onUpdateActions() {
    cc.log("update actions from server")
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
      const serverLable = cc.find("Canvas/ServerIP").getComponent(cc.EditBox)
      const serverIp = "ws://" + serverLable.string + ":2333";

      this.ws = new WebSocket(serverIp);

    }

    const onOpen = this.onOpen.bind(this);
    const onMessage = this.onMessage.bind(this);
    const onClose = this.onClose.bind(this);

    this.ws.onopen = onOpen;
    this.ws.onmessage = onMessage;
    this.ws.onclose = onClose;

    // this.ws.addEventListener("open", this.onOpen.bind(this));
    // this.ws.addEventListener("message", this.onMessage.bind(this));
    // this.ws.addEventListener("close", this.onClose.bind(this));
  }

  onOpen() {
    cc.log("Connected to the server!");
    cc.find(`Canvas/Server Connection`).getComponent(cc.Label).string = "Connected to the Server"
  }

  onClose() {
    cc.log("Disconnected from the server!");
    AnnouncementLable.$.showAnnouncement(`Disconnected From Server`, 3, false)
    this.ws.close();
    this.ws.removeEventListener("open", this.onOpen.bind(this));
    this.ws.removeEventListener("message", this.onMessage.bind(this));
    this.ws.removeEventListener("close", this.onClose.bind(this));
    whevent.emit(Events.LOST_CONNECTION, {});
  }

  onMessage({ data }) {
    const pack = JSON.parse(atob(data));
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
    const time = new Date().toTimeString().substring(0, 8)
    Logger.printMethodSignal([signal, data], true)
    // cc.log("%cSENDING:", "color:#36F;", signal, time);
    // cc.log(data)
    this.ws.send(btoa(JSON.stringify({ signal, data })));
  }

  onUUID(uuid: number) {
    const player: Player = new Player();
    player.playerId = uuid;
  }

  onJoin(uuid) {
    cc.log(uuid);
    const lable = cc.find(`Canvas/Match Players`).getComponent(cc.Label)
    const string = lable.string + `\nPlayer ${uuid.uuid}`;

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
