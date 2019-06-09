/**
 * Communicate with server.
 * @author wheatup
 */
import Events from '../Misc/Events';
import Config from './Config';

import Player from '../Script/Entites/Player';
import Signal from '../Misc/Signal';
import ActionManager from '../Script/Managers/ActionManager';


const { ccclass, property } = cc._decorator;

@ccclass
export default class Server extends cc.Component {
	static $: Server = null;
	static players: Player[] = [];
	static numOfPlayers: number = null;
	ws: WebSocket = null;
	pid: number = 0;
	reactionCounter=0;


	onLoad() {
		Server.$ = this;

		whevent.on(Events.MULTIPLAYER, this.connect, this);
		whevent.on(Signal.CARDDRAWED, this.onPlayerActionFromServer, this)
		whevent.on(Signal.MOVETOTABLE, this.onMoveToTable, this);
		whevent.on(Signal.NEXTTURN, this.onPlayerActionFromServer, this);
		whevent.on(Signal.UUID, this.onUUID, this);
		whevent.on(Signal.JOIN, this.onJoin, this);
		whevent.on(Signal.STARTGAME, this.onStartGame, this);
		whevent.on(Signal.LEAVE, this.onLeave, this);
		whevent.on(Signal.PLAYLOOTCARD, this.onPlayerActionFromServer, this);
		whevent.on(Signal.DECLAREATTACK, this.onPlayerActionFromServer, this);
		whevent.on(Signal.ADDANITEM, this.onPlayerActionFromServer, this);
		whevent.on(Signal.GETREACTION, this.onPlayerActionFromServer, this);
		whevent.on(Signal.FIRSTGETREACTION, this.onPlayerActionFromServer, this);
		whevent.on(Signal.RESOLVEACTIONS, this.onPlayerActionFromServer, this);
		whevent.on(Signal.OTHERPLAYERRESOLVEREACTION, this.onPlayerActionFromServer, this);



	}

	onPlayerActionFromServer({ signal, data }){
		ActionManager.getActionFromServer(signal,data)
	}

	onMoveToTable({ playerID, numOfPlayers }) {
		this.pid = playerID;
		Server.numOfPlayers = numOfPlayers;
		cc.log('Server num of players is ' + Server.numOfPlayers)
	}




	onDestroy() {
		whevent.off(Events.MULTIPLAYER, this.connect, this);
		whevent.off(Signal.JOIN, this.onJoin, this);
		whevent.off(Signal.STARTGAME, this.onStartGame, this);
		whevent.off(Signal.LEAVE, this.onLeave, this);

	}

	connect() {
		//	whevent.emit(Events.TIP, {message: 'Connecting...', time: 0});
		if (this.ws == null) {
			this.ws = new WebSocket("ws://localhost:2333");
		}


		this.ws.addEventListener('open', this.onOpen.bind(this));
		this.ws.addEventListener('message', this.onMessage.bind(this));
		this.ws.addEventListener('close', this.onClose.bind(this));
	}

	onOpen() {
		cc.log('Connected to the server!');
	}

	onClose() {

		cc.log('Disconnected from the server!');
		this.ws.removeEventListener('open', this.onOpen.bind(this));
		this.ws.removeEventListener('message', this.onMessage.bind(this));
		this.ws.removeEventListener('close', this.onClose.bind(this));
		whevent.emit(Events.LOST_CONNECTION);
	}

	onMessage({ data }) {

		let pack = JSON.parse(atob(data));
		whevent.emit(pack.signal, pack.data);
		if(pack.signal == Signal.REACTION ||pack.signal == Signal.FIRSTGETREACTION){
			cc.log(++this.reactionCounter);
		}
		//cc.log('%cRECEIVE:', 'color:#4A3;', pack.signal, pack.data);
	}

	send(signal: string, data?: any) {
		if(signal == Signal.REACTION ||signal == Signal.FIRSTGETREACTION){
			//cc.log(this.reactionCounter);
		}
		//cc.log('%cSENDING:', 'color:#36F;', signal, data);
		this.ws.send(btoa(JSON.stringify({ signal, data })));
	}

	onUUID(uuid: number) {
		let player: Player = new Player();
		player.playerId = uuid;
	}

	onJoin(uuid: number) {
		cc.log(uuid)
	}

	onStartGame({ }) {

		cc.game.addPersistRootNode(this.node)

		Server.$.send(Signal.MOVETOTABLE)
		cc.director.loadScene('MainGame')
	}

	onLeave(uuid: number) {
		whevent.emit(Events.TIP, { message: 'Your Opponent has left!' });
	}


}