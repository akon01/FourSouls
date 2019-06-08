
import { COLLECTORTYPE, printMethodStarted, COLORS } from "../../Constants";
import DataCollectorInterface from "./DataCollectorInterface";


const {ccclass, property} = cc._decorator;

@ccclass
export default class DataCollector extends cc.Component implements DataCollectorInterface {


    collectorName = 'CardPlayer';

    /**
     * 
     * @param data {playerId:Player who played the card}
     */
    collectData(data) {
        cc.log('%cgatherData():', 'color:#4A3;');
        return data.playerId
    }

}
