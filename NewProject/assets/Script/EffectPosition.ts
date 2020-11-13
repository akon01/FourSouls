

const { ccclass, property } = cc._decorator;

@ccclass('EffectPosition')
export default class EffectPosition {

    @property(cc.Integer)
    x: number = 0
    @property(cc.Integer)
    y: number = 0
    @property(cc.Integer)
    width: number = 0
    @property(cc.Integer)
    height: number = 0

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}


    // update (dt) {}
}
