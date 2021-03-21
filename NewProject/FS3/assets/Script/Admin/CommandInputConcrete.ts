import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

import { ICommandInput } from "./CommandInputInterface";

@ccclass('CommandInputConcrete')
export class CommandInputConcrete extends Component implements ICommandInput {
    getCommandInput() {
        return "default"
    }
    // LIFE-CYCLE CALLBACKS:
    // onLoad () {}
    start() {

    }
    // update (dt) {}
}
