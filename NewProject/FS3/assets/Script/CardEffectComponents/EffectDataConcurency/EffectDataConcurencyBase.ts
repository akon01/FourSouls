import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

import { ITEM_TYPE } from "../../Constants";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { IEffectDataConcurency } from "./IEffectDataConcurency";

@ccclass('EffectDataConcurencyBase')
export class EffectDataConcurencyBase extends Component implements IEffectDataConcurency {



















    setDataConcurencyId() {
        if (this.node && this.ConcurencyId == -1) {
            const comps = this.node.getComponents(EffectDataConcurencyBase);
            this.ConcurencyId = comps.findIndex(ed => ed == this);
        }
    }
    ConcurencyId = -1;
    runDataConcurency(newEffectData: ActiveEffectData | PassiveEffectData, numOfEffect: number, type: ITEM_TYPE, sendToServer: boolean): any { }
}



