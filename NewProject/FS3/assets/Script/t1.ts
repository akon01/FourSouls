
import { _decorator, Component, Node } from 'cc';
import { T2 } from './t2';
const { ccclass, property } = _decorator;

@ccclass('T1')
export class T1 extends Component {
    // [1]
    // dummy = '';

    @property(T2)
    t2: T2 | null = null
    // [
    // @property
    // serializableDummy = 0;

    start() {
        // [3]
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
