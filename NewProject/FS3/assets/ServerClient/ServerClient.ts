/**
 * Communicate with server.
 * @author wheatup
 */

import { Component, director, EditBox, find, game, Label, log, _decorator } from 'cc';
import { Events } from "../Misc/Events";
import { Signal } from "../Misc/Signal";
import { Player } from "../Script/Entites/GameEntities/Player";
import { MainScript } from '../Script/MainScript';
import { WrapperProvider } from '../Script/Managers/WrapperProvider';
import { whevent } from "./whevent";
const { ccclass, property } = _decorator;


@ccclass('ServerClient')
export class ServerClient extends Component {

      players: Player[] = [];
      numOfPlayers = -1;




      ws: WebSocket | null = null;
      pid = 0;
      reactionCounter = 0;




      onLoad() {

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
            whevent.on(Signal.CHANGE_TURN_DRAW_PLAYS, this.onPlayerActionFromServer, this);
            whevent.on(Signal.PLAYER_SET_RECHARGE_CHAR_AT_START_OF_TURN, this.onPlayerActionFromServer, this);
            whevent.on(Signal.PLAYER_SET_HAND_SHOW_CARD_BACK, this.onPlayerActionFromServer, this)
            whevent.on(Signal.PLAYER_CHANGE_LOOT_CARD_PLAYS, this.onPlayerActionFromServer, this)
            whevent.on(Signal.PLAYER_CHANGE_NUM_OF_ITEMS_TO_RECHARGE, this.onPlayerActionFromServer, this)
            whevent.on(Signal.PLAYER_CHANGE_EXTRA_SOULS_NEEDED_TO_WIN, this.onPlayerActionFromServer, this)

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
            whevent.on(Signal.CARD_GET_COUNTER, this.onPlayerActionFromServer, this);
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
            whevent.on(Signal.MARK_DECK_AS_DRAW_FROM_PILE_INSTED, this.onPlayerActionFromServer, this);


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

            //ActionLable

            whevent.on(Signal.ACTION_MASSAGE_REMOVE, this.onPlayerActionFromServer, this);

            //Signle Card Evenets
            whevent.on(Signal.SET_CONCURENT_EFFECT_DATA, this.onPlayerActionFromServer, this);
            whevent.on(Signal.CARD_CHANGE_NUM_OF_SOULS, this.onPlayerActionFromServer, this);
            whevent.on(Signal.CARD_SET_OWNER, this.onPlayerActionFromServer, this);
            whevent.on(Signal.ITEM_SET_LAST_OWNER, this.onPlayerActionFromServer, this);
            whevent.on(Signal.ADD_EGG_COUNTER, this.onPlayerActionFromServer, this);
            whevent.on(Signal.REMOVE_EGG_COUNTER, this.onPlayerActionFromServer, this);



            //Card Effect
            whevent.on(Signal.MARK_EFFECT_AS_RUNNING, this.onPlayerActionFromServer, this);



            //AnnouncementLable
            whevent.on(Signal.SHOW_ANNOUNCEMENT, this.onPlayerActionFromServer, this);
            whevent.on(Signal.HIDE_ANNOUNCEMENT, this.onPlayerActionFromServer, this);

            whevent.on(Signal.SHOW_TIMER, this.onPlayerActionFromServer, this);
            whevent.on(Signal.HIDE_TIMER, this.onPlayerActionFromServer, this);

            //button data collector

            whevent.on(Signal.CHOOSE_BUTTON_DATA_COLLECTOR, this.onPlayerActionFromServer, this);
            whevent.on(Signal.CHOOSE_BUTTON_DATA_COLLECTOR_RESPONSE, this.onPlayerActionFromServer, this);

            whevent.on(Signal.MOUSE_CURSOR_MOVE, this.onPlayerActionFromServer, this);
      }


      showPlayerDisconnected(data: { signal: typeof Signal, text: string }) {
            WrapperProvider.announcementLableWrapper.out.showAnnouncement(data.text, 3, false)
      }



      onPlayerActionFromServer(data: { signal: typeof Signal, data: any }) {
            //tslint:disable-next-line: no-floating-promises
            //@ts-ignore
            if (WrapperProvider.actionManagerWrapper)
                  void WrapperProvider.actionManagerWrapper.out.getActionFromServer(data.signal as unknown as string, data.data);
      }

      onMoveToTable(data: { playerID: number, numOfPlayers: number }) {
            this.pid = data.playerID;
            this.numOfPlayers = data.numOfPlayers;
            console.log("Server num of players is " + this.numOfPlayers);
            director.loadScene("MainGame");
      }
      async ttt() {

      }

      onFinishLoad(data: { id: number }) {
            console.log("on finish load")
            // tslint:disable-next-line: no-floating-promises
            const mainScript = WrapperProvider.mainScriptWrapper.out;
            void mainScript.makeFirstUpdateActions(data.id)
      }

      async onUpdateActions() {
            console.log("update actions from server")
            await WrapperProvider.actionManagerWrapper.out.updateActions()
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

                  const serverLable = find("ServerIP", WrapperProvider.CanvasNode)!.getComponent(EditBox)!
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
            console.log("Connected to the server!");

            find(`Server Connection`, WrapperProvider.CanvasNode)!.getComponent(Label)!.string = "Connected to the Server"
      }

      onClose() {
            console.log("Disconnected from the server!");
            WrapperProvider.announcementLableWrapper.out.showAnnouncement(`Disconnected From Server`, 3, false)
            if (this.ws == null) {
                  return
            }
            this.ws.close();
            this.ws.removeEventListener("open", this.onOpen.bind(this));
            this.ws.removeEventListener("message", this.onMessage.bind(this));
            this.ws.removeEventListener("close", this.onClose.bind(this));
            whevent.emit(Events.LOST_CONNECTION, {});
      }

      reviver(key: any, value: any) {
            if (typeof value === 'object' && value !== null) {
                  if (value.dataType === 'Map') {
                        return new Map(value.value);
                  }
            }
            return value;
      }

      onMessage({ data }: any) {
            const pack = JSON.parse(atob(data), this.reviver);
            whevent.emit(pack.signal, pack.data);
            if (
                  pack.signal == Signal.REACTION ||
                  pack.signal == Signal.FIRST_GET_REACTION
            ) {
                  console.log(++this.reactionCounter);
            }
            //console.log('%cRECEIVE:', 'color:#4A3;', pack.signal, pack.data);
      }



      replacer(key: any, value: any) {
            //@ts-ignore
            const originalObject = this[key];
            if (originalObject instanceof Map) {
                  return {
                        dataType: 'Map',
                        value: Array.from(originalObject.entries()), // or with spread: value: [...originalObject]
                  };
            } else {
                  return value;
            }
      }

      send(signal: string, data?: any) {
            if (signal == Signal.REACTION || signal == Signal.FIRST_GET_REACTION) {
                  //console.log(this.reactionCounter);
            }
            const time = new Date().toTimeString().substring(0, 8)
            WrapperProvider.loggerWrapper.out.printMethodSignal([signal, data], true)
            // console.log("%cSENDING:", "color:#36F;", signal, time);
            // console.log(data)
            if (this.ws)
                  this.ws.send(btoa(JSON.stringify({ signal, data }, this.replacer)));
      }

      onUUID(uuid: number) {
            const player: Player = new Player();
            player.playerId = uuid;
      }

      onJoin(uuid: any) {
            console.log(uuid);
            const lable = find(`Match Players`, WrapperProvider.CanvasNode)!.getComponent(Label)!
            const string = lable.string + `\nPlayer ${uuid.uuid}`;

            find(`Match Players`, WrapperProvider.CanvasNode)!.getComponent(Label)!.string = string
      }

      onStartGame() {
            game.addPersistRootNode(this.node);

            WrapperProvider.serverClientWrapper.out!.send(Signal.MOVE_TO_TABLE);
            //  director.loadScene("MainGame");
      }

      onLeave(uuid: number) {
            whevent.emit(Events.TIP, { message: "Your Opponent has left!" });
      }
}
