import { MonsterPlace } from "../MonsterField";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Monster extends cc.Component {

    @property
    monsterPlace: MonsterPlace = null;

    @property
    HP: number = 0;

    @property
    rollValue: number = 0;

    @property
    DMG: number = 0;

    @property
    isAttacked:boolean = false;

    @property
    hasEffect: boolean =false;
    

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
