import { _decorator, Label } from 'cc';
const { ccclass, property } = _decorator;

import { CommandInputConcrete as CCommandInput } from "./CommandInputConcrete";
import { ICommandInput } from "./CommandInputInterface";

@ccclass('NumberInput')
export class NumberInput extends CCommandInput {
    getCommandInput() {
        return this._currentNumber.toString()
    }

    @property(Label)
    label: Label = new Label;

    @property
    _currentNumber = 0

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
