import { ITEM_TYPE } from "../../Constants";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import IdAndName from "../IdAndNameComponent";
import IEffectDataConcurency from "./IEffectDataConcurency";


const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class EffectDataConcurencyBase extends cc.Component implements IEffectDataConcurency {

    resetInEditor() {
        debugger
        this.setDataConcurencyId();
    }
    setDataConcurencyId() {
        if (this.node && this.ConcurencyId == -1) {
            const comps = this.node.getComponents(EffectDataConcurencyBase);
            this.ConcurencyId = comps.findIndex(ed => ed == this);
        }
    }

    @property({ type: cc.Integer, step: 1 })
    ConcurencyId: number = -1;
    abstract runDataConcurency(newEffectData: ActiveEffectData | PassiveEffectData, numOfEffect: number, type: ITEM_TYPE, sendToServer: boolean)

}
