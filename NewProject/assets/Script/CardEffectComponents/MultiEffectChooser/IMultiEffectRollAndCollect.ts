import DataCollector from "../DataCollector/DataCollector";
import Effect from "../CardEffects/Effect";

export class IMultiEffectRollAndCollect extends DataCollector {
    getEffectByNumberRolled(numberRolled: number, cardPlayed: cc.Node): Effect { return new Effect() }
}