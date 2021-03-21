import { _decorator, EditBox } from 'cc';
const { ccclass, property } = _decorator;

import { ICommandInput } from "./CommandInputInterface";
import { CommandInputConcrete as CCommandInput } from "./CommandInputConcrete";

@ccclass('TextInput')
export class TextInput extends CCommandInput {
    getCommandInput() {
        return this.textBox!.string
    }

    @property(EditBox)
    textBox: EditBox | null = null;





    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
