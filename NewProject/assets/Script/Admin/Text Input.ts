import ICommandInput from "./Command Input Interface";
import CCommandInput from "./Command Input Concrete";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TextInput extends CCommandInput {

    getCommandInput() {
        return this.textBox.string
    }

    @property(cc.EditBox)
    textBox: cc.EditBox = null;





    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
