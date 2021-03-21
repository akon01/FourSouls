
import { _decorator, Component, Node, find } from 'cc';
const { ccclass, property } = _decorator;

interface ParameterlessConstructor<F> {
    new(): F;
}

export class GenericNonComponentWrapper<T> {
    out!: T

    /**
     *
     */
    constructor(inCtor: ParameterlessConstructor<T>) {
        this.out = new inCtor()
    }
}


export class GenericWrapper<T extends Component>{
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    out!: T



    /**
     *
     */
    constructor(PathFromWrapperProvider: string, ctorObj: { className?: string, inCtor?: ParameterlessConstructor<T> }) {
        if (ctorObj.className) {
            this.out = find(PathFromWrapperProvider)!.getComponent(ctorObj.className)! as T
        }
        if (ctorObj.inCtor) {
            this.out = find(PathFromWrapperProvider)!.getComponent<T>(ctorObj.inCtor)!
        }
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
