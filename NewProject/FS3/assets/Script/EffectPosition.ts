import { _decorator, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EffectPosition')
export class EffectPosition {
    @property(CCInteger)
    x = 0
    @property(CCInteger)
    y = 0
    @property(CCInteger)
    width = 0
    @property(CCInteger)
    height = 0
    // LIFE-CYCLE CALLBACKS:
    // onLoad () {}
    // update (dt) {}
}
