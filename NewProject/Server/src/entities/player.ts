/**
 * Player entity
 * @author wheatup
 */

import WebSocket from 'ws';
import Match from './match';
declare const Buffer;

export default class Player {
	static players:Player[] = [];
	static UUID: number = 0;

	static getPlayer(ws: WebSocket) {
		//@ts-ignore
		
		if(Player.getPlayerByWs(ws) == null){
			let player = new Player(ws, ++Player.UUID);
			Player.players.push(player)
			return player;
		}	
		 else {
			return Player.getPlayerByWs(ws); 
		}
	}

	ws: WebSocket = null;
	uuid: number = null;
	match: Match = null;

	constructor(ws: WebSocket, uuid: number) {
		this.ws = ws;
		this.uuid = uuid;
	}

	static getPlayerByWs(ws :WebSocket) :Player{
		for (let i = 0; i < Player.players.length; i++) {
			const player = Player.players[i];
			if(player.ws == ws){
				return player;
			}
		}
		return null
	}

	send(signal: string, data: any) {
		let pack = { signal, data };
		try {
			this.ws.send(Buffer.from(JSON.stringify(pack)).toString('base64'));
		} catch (ex) {
			// console.error(ex);
		}
	}

	remove() {
		if(this.match){
			this.match.leave(this);
			this.match = null;
		}
		Player.players.splice(Player.players.indexOf(Player.players[this.uuid]),1) ;
		--Player.UUID 
	}
}
