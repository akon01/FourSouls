

const {ccclass, property} = cc._decorator;

@ccclass
export default class CharacterItem extends cc.Component {

    @property(cc.Node)
    character: cc.Node = null;

    @property  
    activated:boolean = false;



    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
