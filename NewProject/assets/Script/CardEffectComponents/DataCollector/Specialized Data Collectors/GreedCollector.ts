import DataCollector from "../DataCollector";
import { COLLECTORTYPE } from "../../../Constants";
import PlayerManager from "../../../Managers/PlayerManager";
import { EffectTarget } from "../../../Managers/DataInterpreter";
import ChooseCard from "../ChooseCard";
import DiscardLoot from "../../CardEffects/DiscardLoot";
import Player from "../../../Entites/GameEntities/Player";
import CardManager from "../../../Managers/CardManager";





const { ccclass, property } = cc._decorator;

@ccclass
export default class GreedCollector extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'GreedCollector';


    _chooseCard: ChooseCard = new ChooseCard()


    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    async collectData(data) {
        const allPlayers = PlayerManager.players.map(p=>p.getComponent(Player))
        let mostMoneyPlayer:Player[] = []
         allPlayers.forEach(player=>{
            if(mostMoneyPlayer.length==0){
               mostMoneyPlayer.push(player)
            } else {
                if(mostMoneyPlayer.map(p=>p.coins).some(s=>s<player.coins)){
                    mostMoneyPlayer=  mostMoneyPlayer.filter(playero=>playero.coins<player.coins)
                    mostMoneyPlayer.push(player)
                }
            }
        })
       if(mostMoneyPlayer.length==1){
           return new EffectTarget(mostMoneyPlayer[0])
       } else {
        const chosen=  await this._chooseCard.requireChoosingACard(mostMoneyPlayer.map(p=>p.character))
        return new EffectTarget(CardManager.getCardById(chosen.cardChosenId))
       }
    }

}
