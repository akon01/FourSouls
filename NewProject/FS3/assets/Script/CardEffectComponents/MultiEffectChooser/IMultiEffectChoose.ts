import { DataCollector } from "../DataCollector/DataCollector";
import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass("IMultiEffectChoose")
export class IMultiEffectChoose extends DataCollector {
    @property({ visible: function (this: IMultiEffectChoose) { return !this.isOnlyPaid } })
    isOnlyActives = false


    @property({ visible: function (this: IMultiEffectChoose) { return !this.isOnlyActives } })
    isOnlyPaid = false

}