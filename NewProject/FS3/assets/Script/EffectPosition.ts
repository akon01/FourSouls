import { _decorator, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EffectPosition')
export class EffectPosition {
    @property(CCInteger)
    x: number = 0
    @property(CCInteger)
    y: number = 0
    @property(CCInteger)
    width: number = 0
    @property(CCInteger)
    height: number = 0
    // LIFE-CYCLE CALLBACKS:
    // onLoad () {}
    // update (dt) {}
}
