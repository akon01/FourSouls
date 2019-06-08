import { COLORS } from './../../Constants';

import Player from "../../Entites/Player";

import PlayerManager from "../../Managers/PlayerManager";
import { printMethodStarted } from "../../Constants";
import Card from '../../Entites/Card';
import EffectInterface from './EffectInterface';
import Effect from './Effect';
import DataCollector from '../DataCollector/DataCollector';


const {ccclass, property} = cc._decorator;

@ccclass
export default class AddMoney extends Effect {


   effectName="addMoney"

   @property(DataCollector)
   dataCollector = null;

   @property(Number)
   numOfCoins:number = 0;

   /**
    * 
    * @param data {target:PlayerId}
    */
   @printMethodStarted(COLORS.BLUE)
   doEffect(data?:{target:number}) {

     let targetPlayer = PlayerManager.getPlayerById(data.target)
     let player:Player = targetPlayer.getComponent(Player)
     player.changeMoney(this.numOfCoins)

      return new Promise((resolve,reject)=>{resolve(data)})
   }
}
