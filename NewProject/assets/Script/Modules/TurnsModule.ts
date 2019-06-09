import { MAX_PLAYERS, MAX_TURNID } from "../Constants";
import Player from "../Entites/Player";
import Server from "../../ServerClient/ServerClient";
import PlayerManager from "../Managers/PlayerManager";
import { chargeCard } from "./CardModule";
import CardManager from "../Managers/CardManager";


//make the turns ininitally
export function makeNextTurn(currentTurn:Turn):Turn[]{
    var turns:Turn[] = [];
  
    for (let i = 1; i < Server.numOfPlayers+1; i++) {
       
        turns.push(new Turn(i))        
    }
    return turns
}



export function getCurrentPlayer(players:cc.Node[],turn:Turn){
    for (let i = 0; i < players.length; i++) {
        let player = players[i];  
       let playerComp:Player = player.getComponent('Player');
       if(playerComp.playerId == turn.PlayerId){
           return player;
       } 
   };
   return null;
}



export function getNextTurn(currentTurn:Turn,turns:Turn[]):Turn{
    for (let i = 0; i < turns.length; i++) {
        let nextTurn = turns[i];
        if(currentTurn.PlayerId == MAX_TURNID){
            if(nextTurn.PlayerId == 1){
                return nextTurn;
            }
        }
        if(nextTurn.PlayerId == (currentTurn.PlayerId+1)){
            return nextTurn;
        }
    }          
   return null;
}






//Turn class
export class Turn {

    PlayerId:number;

    battlePhase:boolean =false;
    lootCardPlays: number = 1;
    drawPlays: number = 1;
    buyPlays: number = 1;
    attackPlays: number = 1;
    

    constructor(PlayerId:number) {
        this.PlayerId = PlayerId;     
    }

    refreshTurn(){
        let player:Player = PlayerManager.getPlayerById(this.PlayerId).getComponent(Player)
        this.lootCardPlays = player.lootCardPlays;
        this.drawPlays = player.drawPlays;
        this.buyPlays = player.buyPlays;
        this.attackPlays = player.attackPlays     
    }

     startTurn(){
        let player:Player = PlayerManager.getPlayerById(this.PlayerId).getComponent(Player)
        // //draw cards
        //  for (let i = 0; i < this.drawPlays; i++) {
        //     player.drawCard(CardManager.);       
        //  }
         //charge items
        //  const playerCards = player.cards;   
        //  for (let j = 0; j < playerCards.length; j++) {
        //      const card = playerCards[j];
        //     chargeCard(card);
        //  }
     }

}