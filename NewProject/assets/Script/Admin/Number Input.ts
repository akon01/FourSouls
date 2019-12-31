import CCommandInput from "./Command Input Concrete";
import ICommandInput from "./Command Input Interface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NumberInput extends CCommandInput {

    getCommandInput() {
        return this._currentNumber.toString()
    }

    @property(cc.Label)
    label: cc.Label = null;

    @property
    _currentNumber: number = 0

    add() {
        this._currentNumber++
        this.label.string = this._currentNumber.toString()

    }
    remove() {
        this._currentNumber--
        this.label.string = this._currentNumber.toString()
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
