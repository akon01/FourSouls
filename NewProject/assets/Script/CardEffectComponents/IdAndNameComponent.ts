const { ccclass, property } = cc._decorator;

@ccclass("IdAndName")
export default class IdAndName {

    @property(cc.String)
    name: string = "";

    @property({ type: cc.Integer, step: 1 })
    id: number = -1



    // static getNew(id: number, name: string) {
    //     const newIdAndName = new IdAndName()
    //     newIdAndName.id = id
    //     newIdAndName.name = name
    //     return newIdAndName
    // }

}
