import { _decorator, CCString, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('IdAndNameComponent')
export class IdAndNameComponent {
    @property(CCString)
    name: string = "";
    @property({ type: CCInteger, step: 1 })
    id: number = -1
    // getNew(id: number, name: string) {
    //     const newIdAndName = new IdAndName()
    //     newIdAndName.id = id
    //     newIdAndName.name = name
    //     return newIdAndName
    // }
}