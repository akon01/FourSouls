import { CHOOSE_TYPE } from './../../Constants';
import DataCollector from "../DataCollector/DataCollector";


const {ccclass, property} = cc._decorator;


export default interface EffectInterface  {

   effectName:string;

   chooseType:CHOOSE_TYPE;

   dataCollector:DataCollector;

   doEffect(data?):Promise<{}>;

}
