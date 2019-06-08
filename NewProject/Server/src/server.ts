/**
 * Server
 * @author wheatup
 */

import WebSocket, { Server as WebSocketServer } from 'ws';
import Player from './entities/player';
import Signal from './enums/signal';
import * as whevent from 'whevent';
import * as fs from 'fs';
import signal from './enums/signal';
import Match from './entities/match';
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
		console.log('Loading config...');
		this.config = await this.loadConfig();
		console.log('Loading dictionary...');
		this.words = await this.loadWords();
		console.log('Setting up server...');
		this.setupWebSocket();
		this.bindEvents();
	}

	bindEvents() {
		whevent.on(signal.MATCH, this.onRequestMatch, this);
		whevent.on(signal.MOVETOTABLE, this.moveToTable,this)
		whevent.on(signal.NEXTTURN, this.nextTurn,this)
		whevent.on(signal.STARTGAME, this.onStartGame, this);
		whevent.on(signal.VALIDATE, this.onValidate, this);
		whevent.on(signal.CARDDRAWED, this.onCardDrawed, this);
		whevent.on(signal.ADDANITEM, this.onAddItem, this);
		whevent.on(signal.DECLAREATTACK, this.onDeclareAttack, this);
		whevent.on(signal.PLAYLOOTCARD, this.onLootCardPlayed, this);
		whevent.on(Signal.GETREACTION, this.onGetReaction, this);
		whevent.on(Signal.FIRSTGETREACTION, this.onGetReaction, this);
		whevent.on(Signal.RESOLVEACTIONS, this.onResolveActions, this);
		
	}

	onRequestMatch({ player, data }) {
		if (Player.players.length >= 2) {
			let match = Match.getMatch();
			match.join(player);		
		}
	}

	
	onStartGame({ player, data }) {

		if (Player.players.length >= 2) {	
			console.log('Starting match with '+ player.match.players.length +' Players')
			player.match.start();
		}


	}


	moveToTable({player , data}){
		console.log('Move to table request from players')
		player.send(signal.MOVETOTABLE, { playerID:player.uuid , numOfPlayers:Player.players.length})
	}

	onGetReaction({player , data}){
		player.match.broadcastToNextPlayer(player,signal.GETREACTION,data)
	}

	onResolveActions({player , data}){
		console.log('onResolveActions');
		let firstPlayer = player.match.getPlayerById(data.data.originalPlayer)
		console.log(firstPlayer);
		
		firstPlayer.send(signal.RESOLVEACTIONS,data)
		player.match.broadcastExept(firstPlayer,signal.OTHERPLAYERRESOLVEREACTION,data)
		//add broadcast to other players with diffrent signal to exceute "other side action stack"
	}

		
	onCardDrawed({ player, data }) {
		player.match.broadcastExept(player,signal.CARDDRAWED,data)
	}

		
	onDeclareAttack({ player, data }) {
		player.match.broadcastExept(player,signal.DECLAREATTACK,data)
	}

		
	onLootCardPlayed({ player, data }) {
		player.match.broadcastExept(player,signal.PLAYLOOTCARD,data)
	}

	
	onAddItem({ player, data }) {

		player.match.broadcastExept(player,signal.ADDANITEM,data)


	}

	nextTurn({ player, data }) {
	

		player.match.broadcastExept(player,signal.NEXTTURN,data)


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
			console.log('\x1b[33m%s\x1b[0m', `Websocket server listening on port ${this.config.port}...`);
			this.wss.on('connection', ws => {
				let player = Player.getPlayer(ws);
				this.onConnection(player);
				ws.on('message', (message: string) => {
					this.onMessage(player, message);
				});
				ws.on('close', (ws: WebSocket) => {
					this.onClose(player);
				});
			});
		});
	}

	loadConfig(): Promise<any> {
		return new Promise((resolve, reject) => {
			fs.readFile('./resources/config.json', (err, data) => {
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
			fs.readFile('./resources/words.json', (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(JSON.parse(data.toString()));
				}
			});
		});
	}

	onConnection(player: Player) {
		console.log(`Player ${player.uuid} has connected!`);
		player.send(Signal.UUID, player.uuid);
	}

	onClose(player: Player) {
		player.remove();
		console.log(`Player ${player.uuid} has disconnected!`);
	}

	onError(player: Player, err) {
		console.log(`Player ${player.uuid} has encountered an error!`, err);
	}

	onMessage(player: Player, message: string) {
		try {
			let data = JSON.parse(Buffer.from(message, 'base64').toString());
			console.log(`Player ${player.uuid}: `, data);
			whevent.emit(data.signal, { player, data });
		} catch (ex) {
			console.error(ex);
			console.error(`Player ${player.uuid} unknown package: `, message);
		}
	}

	send(player: Player, signal: string, message: object) {
		player.send(signal, message);
	}
}
