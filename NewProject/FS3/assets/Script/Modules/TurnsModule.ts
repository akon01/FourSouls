//Turn class

import { log, Node } from 'cc';
import { Signal } from "../../Misc/Signal";
import { Player } from "../Entites/GameEntities/Player";
import { WrapperProvider } from '../Managers/WrapperProvider';

export function getCurrentPlayer(players: Node[], turn: Turn) {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const playerComp: Player = player.getComponent(Player)!;
    if (playerComp.playerId == turn.PlayerId) {
      return player;
    }
  }
  return null;
}

//Turn class
export class Turn {
  PlayerId: number;
  turnId!: number
  battlePhase = false;




  constructor(PlayerId: number) {
    this.PlayerId = PlayerId;
  }

  refreshTurn() {
    const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerById(this.PlayerId)!
    //TODO: Restore To 1 After checking
    player.attackPlays += 1
    //add turn loot card play
    player.changeLootCardPlayes(1, false)
    //add turn buy play
    player.buyPlays += 1;


    // player.attackPlays += 10000
    // //add turn loot card play
    // player.lootCardPlays += 10000
    // //add turn buy play
    // player.buyPlays += 10000;
    console.log(`refreshed turn for player ${player.playerId}`)
    this.battlePhase = false;
    this.turnId = ++WrapperProvider.turnsManagerWrapper.out.turnId

  }

  endTurn(sendToServer:boolean) {
    const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerById(this.PlayerId)!
    if (player.attackPlays > 0) {
      //remove turn attack play
      player.attackPlays -= 1
    }
    if (player.getLootCardPlays() > 0) {
      //remove turn loot card play
      player.changeLootCardPlayes(1, false)
    }
    if (player.buyPlays > 0) {
      //remove turn buy play
      player.buyPlays -= 1;
    }
  }

  getTurnPlayer() {
    return WrapperProvider.playerManagerWrapper.out.getPlayerById(this.PlayerId)
  }

  async startTurn() {
    console.log(`start turn`)
    const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerById(this.PlayerId)!
    console.log(`turn player ${player.name}`)
    console.log(`me player ${WrapperProvider.playerManagerWrapper.out.mePlayer!.name}`)
    if (player.node.name == WrapperProvider.playerManagerWrapper.out.mePlayer!.name) {
      await player.startTurn(player.turnDrawPlays, player.calcNumOfItemsToCharge(), true)
    } else {
      WrapperProvider.serverClientWrapper.out.send(Signal.START_TURN, { playerId: player.playerId })
    }
  }
}


export class OneTimeTurn extends Turn {
  endTurn(sendToServer:boolean){
    super.endTurn(sendToServer)
    WrapperProvider.turnsManagerWrapper.out.removeTurn(this,sendToServer)
  }
}
