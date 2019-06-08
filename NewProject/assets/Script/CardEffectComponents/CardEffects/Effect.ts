
import Player from "../../Entites/Player";
import EffectInterface from "./EffectInterface";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE } from "../../Constants";


const {ccclass, property} = cc._decorator;

@ccclass
export default class Effect extends cc.Component implements EffectInterface {

   effectName: string = null;

   chooseType:CHOOSE_TYPE = null;

   @property(DataCollector)
   dataCollector:DataCollector = null;




   /**
    * 
    * @param data {target:Player}
    */
   doEffect(data?) {
      return new Promise((resolve,reject)=>{})
   }
}
